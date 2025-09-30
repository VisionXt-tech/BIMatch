/**
 * Script per eliminare tutti i dati associati a un utente specifico
 *
 * ATTENZIONE: Questo script elimina PERMANENTEMENTE tutti i dati.
 * Assicurati di avere un backup prima di eseguirlo.
 *
 * Usage:
 *   node cleanup-user-data.js <uid>
 *
 * Oppure modifica la variabile USER_UID_TO_DELETE qui sotto
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase config - usa le stesse variabili d'ambiente del progetto
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// ============================================
// CONFIGURA QUI L'UID DELL'UTENTE DA ELIMINARE
// ============================================
const USER_UID_TO_DELETE = process.argv[2] || 'INSERISCI_QUI_UID'; // Sostituisci con l'UID reale

// Oppure cerca per email (meno efficiente)
const USER_EMAIL_TO_SEARCH = 'progetti@visionxt.tech';

async function cleanupUserData() {
  console.log('\n🔥 CLEANUP USER DATA SCRIPT 🔥\n');
  console.log('⚠️  ATTENZIONE: Questo eliminerà PERMANENTEMENTE tutti i dati!\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let targetUID = USER_UID_TO_DELETE;

  // Se UID non è fornito, cerca per email
  if (targetUID === 'INSERISCI_QUI_UID' || !targetUID) {
    console.log(`🔍 Cercando utente con email: ${USER_EMAIL_TO_SEARCH}...`);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', USER_EMAIL_TO_SEARCH));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ Utente non trovato in Firestore (probabilmente già eliminato da users collection)');
      console.log('📝 Inserisci manualmente l\'UID come parametro:');
      console.log('   node cleanup-user-data.js <uid>');
      process.exit(1);
    }

    targetUID = snapshot.docs[0].id;
    console.log(`✅ Trovato utente con UID: ${targetUID}\n`);
  } else {
    console.log(`🎯 Target UID: ${targetUID}\n`);
  }

  // Conferma prima di procedere
  console.log('📋 Questo script eliminerà:');
  console.log('   - Tutti i progetti creati dall\'utente (collection: projects)');
  console.log('   - Tutte le candidature dell\'utente (collection: projectApplications)');
  console.log('   - Tutte le notifiche dell\'utente (collection: notifications)');
  console.log('   - Il documento utente (collection: users) se ancora presente\n');

  // Statistiche
  const stats = {
    projects: 0,
    applications: 0,
    notifications: 0,
    user: 0
  };

  try {
    // 1. Elimina progetti creati dall'utente (companyId)
    console.log('🗑️  Eliminando progetti...');
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(projectsRef, where('companyId', '==', targetUID));
    const projectsSnapshot = await getDocs(projectsQuery);

    for (const docSnap of projectsSnapshot.docs) {
      await deleteDoc(doc(db, 'projects', docSnap.id));
      stats.projects++;
      console.log(`   ✓ Eliminato progetto: ${docSnap.id}`);
    }
    console.log(`✅ Eliminati ${stats.projects} progetti\n`);

    // 2. Elimina candidature dell'utente (professionalId)
    console.log('🗑️  Eliminando candidature come professionista...');
    const appsRef = collection(db, 'projectApplications');
    const appsQuery = query(appsRef, where('professionalId', '==', targetUID));
    const appsSnapshot = await getDocs(appsQuery);

    for (const docSnap of appsSnapshot.docs) {
      await deleteDoc(doc(db, 'projectApplications', docSnap.id));
      stats.applications++;
      console.log(`   ✓ Eliminata candidatura: ${docSnap.id}`);
    }
    console.log(`✅ Eliminate ${stats.applications} candidature\n`);

    // 3. Elimina notifiche dell'utente (userId)
    console.log('🗑️  Eliminando notifiche...');
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, where('userId', '==', targetUID));
    const notificationsSnapshot = await getDocs(notificationsQuery);

    for (const docSnap of notificationsSnapshot.docs) {
      await deleteDoc(doc(db, 'notifications', docSnap.id));
      stats.notifications++;
      console.log(`   ✓ Eliminata notifica: ${docSnap.id}`);
    }
    console.log(`✅ Eliminate ${stats.notifications} notifiche\n`);

    // 4. Elimina documento utente se ancora presente
    console.log('🗑️  Controllando documento utente...');
    try {
      const userDocRef = doc(db, 'users', targetUID);
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', targetUID)));

      if (!userDoc.empty) {
        await deleteDoc(userDocRef);
        stats.user = 1;
        console.log(`   ✓ Eliminato documento utente: ${targetUID}`);
      } else {
        console.log(`   ℹ️  Documento utente già eliminato`);
      }
    } catch (err) {
      console.log(`   ℹ️  Documento utente già eliminato o non accessibile`);
    }
    console.log(`✅ Pulizia documento utente completata\n`);

    // Riepilogo finale
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RIEPILOGO ELIMINAZIONI');
    console.log('═══════════════════════════════════════');
    console.log(`   Progetti:         ${stats.projects}`);
    console.log(`   Candidature:      ${stats.applications}`);
    console.log(`   Notifiche:        ${stats.notifications}`);
    console.log(`   Utente:           ${stats.user ? 'Sì' : 'Già eliminato'}`);
    console.log('═══════════════════════════════════════\n');
    console.log('✅ Pulizia completata con successo!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRORE durante la pulizia:', error);
    console.error('\nDettagli:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
cleanupUserData();
