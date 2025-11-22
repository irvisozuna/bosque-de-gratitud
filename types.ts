
export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Message {
  id: string;
  senderEmail: string;
  senderName: string;
  receiverEmail: string;
  type: MessageType;
  content: string; // Text content or URL to media
  createdAt: number;
  isRead: boolean;
  position: [number, number, number]; // 3D coordinates
  color: string;
}

export interface CreateMessageDTO {
  receiverEmail: string;
  content: string;
  type: MessageType;
}
