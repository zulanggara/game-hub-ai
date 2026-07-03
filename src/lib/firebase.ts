import { initializeApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.databaseURL);

let database: Database | null = null;

export function getRoomDatabase(): Database {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase belum dikonfigurasi. Isi VITE_FIREBASE_* di .env.local (lihat .env.example)."
    );
  }
  if (!database) {
    const app = initializeApp(config);
    database = getDatabase(app);
  }
  return database;
}
