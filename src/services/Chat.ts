import api from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProductSuggestion {
  name: string;
  price: number;
  original_price?: number;
  category: string;
  description: string;
  slug: string;
  stock: number;
  on_sale: boolean;
}

export interface ChatRequest {
  messages: ChatMessage[];
  user_id?: string;
}

export interface ChatResponse {
  message: string;
  products: ProductSuggestion[];
  intent: string;
}

export const ChatService = {
  /**
   * Send chat messages and get AI response with product suggestions
   */
  sendMessage: async (messages: ChatMessage[], userId?: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>("/chat", {
      messages,
      user_id: userId,
    });
    return response.data;
  },
};

export default ChatService;
