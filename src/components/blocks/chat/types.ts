export interface ChatMessage {
  id: string;
  chatId: string;
  orderId: string;
  senderId: string;
  senderType: 'user' | 'assistant' | 'system';
  messageText: string;
  images?: string[]; // Массив URL изображений
  meta: Record<string, unknown>;
  createdAt: string;
}

