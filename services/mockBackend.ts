import { Message, MessageType, User, CreateMessageDTO } from '../types';

// Simulated Latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock User
export const MOCK_USER: User = {
  id: 'u_123',
  name: 'Explorador',
  email: 'user@example.com',
  avatarUrl: 'https://picsum.photos/seed/user/100/100',
};

// Colors for envelopes
const ENVELOPE_COLORS = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#d8b4fe'];

// Generate random position around the tree, ensuring they stay ABOVE ground
const getRandomPosition = (): [number, number, number] => {
  const radius = 4 + Math.random() * 4; // Radius between 4 and 8
  const theta = Math.random() * Math.PI * 2; // 360 degrees around

  const x = radius * Math.cos(theta);
  // Enforce height: Minimum 1.5m, Maximum 5.5m
  const y = 1.5 + Math.random() * 4; 
  const z = radius * Math.sin(theta);
  
  return [x, y, z];
};

const STORAGE_KEY = 'gratitude_forest_messages';

const getStoredMessages = (): Message[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Seed initial messages
    const initial: Message[] = [
      {
        id: 'm_1',
        senderName: 'Santa Claus',
        senderEmail: 'santa@northpole.com',
        receiverEmail: MOCK_USER.email,
        type: MessageType.TEXT,
        content: "Bienvenido al Bosque de la Gratitud. Que tus fiestas estén llenas de paz y luz mágica.",
        createdAt: Date.now(),
        isRead: false,
        position: getRandomPosition(),
        color: '#ef4444'
      },
      {
        id: 'm_2',
        senderName: 'Mamá',
        senderEmail: 'mama@familia.com',
        receiverEmail: MOCK_USER.email,
        type: MessageType.TEXT,
        content: "Estoy muy orgullosa de la persona en la que te has convertido. Te quiero siempre.",
        createdAt: Date.now() - 100000,
        isRead: false,
        position: getRandomPosition(),
        color: '#eab308'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const fetchMessages = async (): Promise<Message[]> => {
  await delay(800); // Simulate network
  return getStoredMessages();
};

export const sendMessage = async (dto: CreateMessageDTO, sender: User): Promise<boolean> => {
  await delay(1500); // Simulate sending
  
  // If sending to self (for demo purposes), add to local store
  if (dto.receiverEmail === sender.email) {
    const messages = getStoredMessages();
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      senderName: sender.name,
      senderEmail: sender.email,
      receiverEmail: dto.receiverEmail,
      type: dto.type,
      content: dto.content,
      createdAt: Date.now(),
      isRead: false,
      position: getRandomPosition(),
      color: ENVELOPE_COLORS[Math.floor(Math.random() * ENVELOPE_COLORS.length)]
    };
    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }
  
  return true;
};

export const markMessageRead = async (messageId: string): Promise<void> => {
    const messages = getStoredMessages();
    const updated = messages.map(m => m.id === messageId ? { ...m, isRead: true } : m);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};