
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// CONFIGURACIÓN DE FIREBASE
// Si tienes tus claves reales, ponlas aquí.
// Si dejas "TU_API_KEY_AQUI", la app funcionará en MODO DEMO (Local).
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "TU_API_KEY_AQUI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tu-proyecto",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tu-proyecto.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Detectar si estamos usando la configuración por defecto (inválida)
export const useMock = firebaseConfig.apiKey === "TU_API_KEY_AQUI";

let app;
let auth: any;
let googleProvider: any;
let db: any;
let storage: any;

if (!useMock) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Error inicializando Firebase, cambiando a modo Mock:", error);
    // Fallback automático si la inicialización falla aunque la key parezca válida
  }
} else {
  console.warn("⚠️ MODO DEMO ACTIVADO: Usando almacenamiento local (No se requiere Firebase Key)");
}

export { auth, googleProvider, db, storage };
