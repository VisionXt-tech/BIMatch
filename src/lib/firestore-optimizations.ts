/**
 * Firestore Query Optimizations
 * 
 * Utility functions to optimize common Firestore query patterns
 * and reduce read operations.
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  type Firestore,
  type DocumentSnapshot,
  type QuerySnapshot 
} from 'firebase/firestore';

/**
 * Batch fetch documents in parallel
 * More efficient than sequential getDoc calls
 */
export async function batchGetDocs<T>(
  db: Firestore,
  collectionPath: string,
  ids: string[]
): Promise<Map<string, T | null>> {
  if (ids.length === 0) return new Map();

  const promises = ids.map(id => 
    getDoc(doc(db, collectionPath, id))
  );

  const snapshots = await Promise.all(promises);
  const result = new Map<string, T | null>();

  snapshots.forEach((snap, index) => {
    result.set(ids[index], snap.exists() ? snap.data() as T : null);
  });

  return result;
}

/**
 * Try to fetch from multiple collection paths in parallel
 * Useful for dual-source data (jobs vs projects, etc.)
 */
export async function fetchFromMultipleSources<T>(
  db: Firestore,
  paths: Array<{ collection: string; id: string }>
): Promise<{ data: T | null; source: string | null }> {
  const promises = paths.map(({ collection, id }) => 
    getDoc(doc(db, collection, id))
  );

  const snapshots = await Promise.all(promises);

  for (let i = 0; i < snapshots.length; i++) {
    if (snapshots[i].exists()) {
      return {
        data: snapshots[i].data() as T,
        source: paths[i].collection
      };
    }
  }

  return { data: null, source: null };
}

/**
 * Cache wrapper for Firestore queries
 * Simple in-memory cache with TTL
 */
export class FirestoreCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // Default 5 minutes
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

/**
 * Paginated query helper
 * Returns data + cursor for next page
 */
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
}

export async function paginatedQuery<T>(
  db: Firestore,
  collectionPath: string,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot | null,
  ...queryConstraints: any[]
): Promise<PaginatedResult<T>> {
  let q = query(collection(db, collectionPath), ...queryConstraints);

  if (lastDoc) {
    // Add startAfter cursor
    const { startAfter } = await import('firebase/firestore');
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const data: T[] = [];
  
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() } as T);
  });

  return {
    data,
    hasMore: data.length === pageSize,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
  };
}

/**
 * Optimized user profile fetcher with cache
 */
const profileCache = new FirestoreCache<any>(10 * 60 * 1000); // 10 min cache

export async function fetchUserProfile(
  db: Firestore,
  userId: string,
  useCache: boolean = true
): Promise<any | null> {
  const cacheKey = `user_${userId}`;

  if (useCache) {
    const cached = profileCache.get(cacheKey);
    if (cached) return cached;
  }

  const docSnap = await getDoc(doc(db, 'users', userId));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (useCache) {
    profileCache.set(cacheKey, data);
  }

  return data;
}

/**
 * Clear all caches (call on logout or profile update)
 */
export function clearAllCaches(): void {
  profileCache.clear();
}
