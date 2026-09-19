export type Language = "de" | "en";

export type ToolId = "excuse" | "cooked" | "apology" | "decision";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
}

export interface ToolConfig {
  id: ToolId;
  name: Record<Language, string>;
  greeting: Record<Language, string>;
  suggestions?: Record<Language, string[]>;
  placeholder: Record<Language, string>;
}
