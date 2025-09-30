/**
 * Script per trovare l'UID di un utente dai suoi progetti
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function findUserUID() {
  console.log('\n🔍 Cercando progetti con email progetti@visionxt.tech...\n');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // Cerca nei progetti
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);

    console.log(`📦 Trovati ${projectsSnapshot.size} progetti totali\n`);

    const orphanedProjects = [];

    for (const docSnap of projectsSnapshot.docs) {
      const data = docSnap.data();
      const companyId = data.companyId;

      // Verifica se l'utente esiste ancora
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('__name__', '==', companyId));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        orphanedProjects.push({
          projectId: docSnap.id,
          companyId: companyId,
          title: data.title || 'N/A',
          companyEmail: data.companyEmail || 'N/A',
        });
      }
    }

    if (orphanedProjects.length > 0) {
      console.log('🗑️  Trovati progetti ORFANI (utente eliminato):\n');
      orphanedProjects.forEach((p, i) => {
        console.log(`${i + 1}. Progetto: "${p.title}"`);
        console.log(`   ID Progetto: ${p.projectId}`);
        console.log(`   Company ID (UID): ${p.companyId}`);
        console.log(`   Email: ${p.companyEmail}`);
        console.log('');
      });

      console.log('\n💡 Per eliminare tutti i dati di questo utente, esegui:');
      console.log(`   node cleanup-user-data.js ${orphanedProjects[0].companyId}\n`);
    } else {
      console.log('✅ Nessun progetto orfano trovato!\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    process.exit(1);
  }
}

findUserUID();
