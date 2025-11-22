
import { 
    signInWithPopup, 
    signOut as firebaseSignOut 
} from "firebase/auth";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    updateDoc, 
    doc
} from "firebase/firestore";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";
import { auth, googleProvider, db, storage, useMock } from "../firebaseConfig";
import { Message, MessageType, CreateMessageDTO, User } from "../types";

// ==========================================
// UTILITIES FOR MOCK MODE (Local Storage)
// ==========================================

const MOCK_STORAGE_KEY_MSGS = 'gratitude_forest_messages_v2';
const MOCK_STORAGE_KEY_USER = 'gratitude_forest_user';

// Convert Blob to Base64 for local storage video persistence
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Mock Random Position
const getRandomPosition = (): [number, number, number] => {
  const radius = 4 + Math.random() * 4; 
  const theta = Math.random() * Math.PI * 2; 
  const x = radius * Math.cos(theta);
  const y = 1.5 + Math.random() * 3.5; 
  const z = radius * Math.sin(theta);
  return [x, y, z];
};

const ENVELOPE_COLORS = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#d8b4fe'];

// ==========================================
// SERVICE IMPLEMENTATION
// ==========================================

export const signInWithGoogle = async (): Promise<User | null> => {
    if (useMock) {
        // SIMULACIÓN DE LOGIN
        const mockUser: User = {
            id: 'mock_user_' + Date.now(),
            name: 'Explorador Demo',
            email: 'demo@ejemplo.com',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        };
        localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(mockUser));
        // Recargar página para disparar el listener de estado (simulado en App.tsx via getCurrentUser)
        window.location.reload(); 
        return mockUser;
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        return {
            id: user.uid,
            name: user.displayName || "Explorador",
            email: user.email || "",
            avatarUrl: user.photoURL || ""
        };
    } catch (error) {
        console.error("Error login:", error);
        return null;
    }
};

export const logout = async () => {
    if (useMock) {
        localStorage.removeItem(MOCK_STORAGE_KEY_USER);
        window.location.reload();
        return;
    }
    await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
    if (useMock) {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY_USER);
        return stored ? JSON.parse(stored) : null;
    }
    
    const user = auth?.currentUser;
    if (!user) return null;
    return {
        id: user.uid,
        name: user.displayName || "Explorador",
        email: user.email || "",
        avatarUrl: user.photoURL || ""
    };
};


export const fetchMessages = async (userEmail: string): Promise<Message[]> => {
    if (!userEmail) return [];

    // --- MOCK MODE ---
    if (useMock) {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY_MSGS);
        let allMessages: Message[] = stored ? JSON.parse(stored) : [];
        
        // Si no hay mensajes, creamos unos de bienvenida para la demo
        if (allMessages.length === 0) {
             allMessages = [
                {
                    id: 'welcome_1',
                    senderName: 'Santa Claus',
                    senderEmail: 'santa@polo.norte',
                    receiverEmail: userEmail,
                    type: MessageType.TEXT,
                    content: '¡Jo jo jo! Bienvenido al Bosque de la Gratitud. ¡Prueba a grabar un video!',
                    createdAt: Date.now(),
                    isRead: false,
                    position: getRandomPosition(),
                    color: '#ef4444'
                }
            ];
            localStorage.setItem(MOCK_STORAGE_KEY_MSGS, JSON.stringify(allMessages));
        }

        // Filtrar solo los míos
        return allMessages.filter(m => m.receiverEmail === userEmail);
    }

    // --- REAL MODE ---
    try {
        const q = query(
            collection(db, "messages"), 
            where("receiverEmail", "==", userEmail)
        );
        
        const querySnapshot = await getDocs(q);
        const messages: Message[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                senderName: data.senderName,
                senderEmail: data.senderEmail,
                receiverEmail: data.receiverEmail,
                type: data.type as MessageType,
                content: data.content,
                createdAt: data.createdAt,
                isRead: data.isRead,
                position: data.position || getRandomPosition(),
                color: data.color || '#fca5a5'
            });
        });
        
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const sendMessage = async (dto: CreateMessageDTO, sender: User, fileBlob?: Blob): Promise<boolean> => {
    let contentUrl = dto.content;

    // --- MOCK MODE ---
    if (useMock) {
        if (fileBlob && (dto.type === MessageType.AUDIO || dto.type === MessageType.VIDEO)) {
             // Convertir a Base64 para guardarlo en LocalStorage (Simula Storage)
             contentUrl = await blobToBase64(fileBlob);
        }

        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderName: sender.name,
            senderEmail: sender.email,
            receiverEmail: dto.receiverEmail,
            type: dto.type,
            content: contentUrl,
            createdAt: Date.now(),
            isRead: false,
            position: getRandomPosition(),
            color: ENVELOPE_COLORS[Math.floor(Math.random() * ENVELOPE_COLORS.length)]
        };

        const stored = localStorage.getItem(MOCK_STORAGE_KEY_MSGS);
        const messages = stored ? JSON.parse(stored) : [];
        messages.push(newMessage);
        localStorage.setItem(MOCK_STORAGE_KEY_MSGS, JSON.stringify(messages));
        return true;
    }

    // --- REAL MODE ---
    try {
        // 1. Subir Archivo
        if (fileBlob && (dto.type === MessageType.AUDIO || dto.type === MessageType.VIDEO)) {
            const fileExt = 'webm'; 
            const fileName = `messages/${Date.now()}_${sender.id}.${fileExt}`;
            const storageRef = ref(storage, fileName);
            
            const snapshot = await uploadBytes(storageRef, fileBlob);
            contentUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Guardar en DB
        await addDoc(collection(db, "messages"), {
            senderName: sender.name,
            senderEmail: sender.email,
            receiverEmail: dto.receiverEmail,
            type: dto.type,
            content: contentUrl,
            createdAt: Date.now(),
            isRead: false,
            position: getRandomPosition(),
            color: ENVELOPE_COLORS[Math.floor(Math.random() * ENVELOPE_COLORS.length)]
        });

        return true;
    } catch (error) {
        console.error("Error sending message:", error);
        return false;
    }
};

export const markMessageRead = async (messageId: string): Promise<void> => {
    if (useMock) {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY_MSGS);
        if (!stored) return;
        const messages = JSON.parse(stored) as Message[];
        const updated = messages.map(m => m.id === messageId ? { ...m, isRead: true } : m);
        localStorage.setItem(MOCK_STORAGE_KEY_MSGS, JSON.stringify(updated));
        return;
    }

    try {
        const msgRef = doc(db, "messages", messageId);
        await updateDoc(msgRef, { isRead: true });
    } catch (error) {
        console.error("Error marking read:", error);
    }
};
