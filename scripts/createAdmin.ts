import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "your-api-key",
  authDomain: "your-auth-domain.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdmin(uid: string, email: string, name?: string) {
  try {
    const adminData = {
      email,
      name: name || email,
      role: "admin",
      createdAt: new Date()
    };
    await setDoc(doc(db, 'admins', uid), adminData);
    console.log(`Admin created for UID: ${uid}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

if (require.main === module) {
  const [, , uidArg, emailArg, nameArg] = process.argv;
  if (!uidArg || !emailArg) {
    console.error('Usage: ts-node createAdmin.ts <uid> <email> [name]');
    process.exit(1);
  }
  createAdmin(uidArg, emailArg, nameArg).then(() => {
    console.log('Admin creation completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Admin creation failed:', error);
    process.exit(1);
  });
}

export { createAdmin };
