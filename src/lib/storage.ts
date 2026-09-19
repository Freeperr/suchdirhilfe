import { ChatState, Language, Message } from "./types";

const STORAGE_PREFIX = "sdh_";
const DAILY_LIMIT = 50;
const SECRET_SALT = "x7q2m!kP9vR#sL4f";

function getKey(toolId: string): string {
  return `${STORAGE_PREFIX}chat_${toolId}`;
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTodayKey(): string {
  const now = new Date();
  const raw = `${SECRET_SALT}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
  return `${STORAGE_PREFIX}c_${hashStr(raw).toString(36)}`;
}

function getChecksum(count: number, dateStr: string): string {
  const data = `${SECRET_SALT}:${count}:${dateStr}`;
  return String(hashStr(data));
}

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
}

const TOOL_IDS = ["excuse", "cooked", "apology", "decision"];

interface StoredLimit {
  c: number;
  s: string;
}

interface ChatStateBackup extends ChatState {
  _mc?: number;
  _md?: string;
}

function getBackupCount(): number {
  let maxCount = 0;
  const todayStr = getTodayDateStr();
  for (const tid of TOOL_IDS) {
    try {
      const raw = localStorage.getItem(getKey(tid));
      if (!raw) continue;
      const parsed: ChatStateBackup = JSON.parse(raw);
      if (parsed._mc && parsed._md === todayStr) {
        maxCount = Math.max(maxCount, parsed._mc);
      }
    } catch { /* skip */ }
  }
  return maxCount;
}

export function loadChat(toolId: string): ChatState {
  if (typeof window === "undefined") return { messages: [] };
  try {
    const raw = localStorage.getItem(getKey(toolId));
    if (!raw) return { messages: [] };
    const parsed = JSON.parse(raw) as ChatState;
    return { messages: parsed.messages || [] };
  } catch {
    return { messages: [] };
  }
}

export function saveChat(toolId: string, state: ChatState, totalUserMsgsToday?: number): void {
  if (typeof window === "undefined") return;
  const backup: ChatStateBackup = {
    ...state,
    _mc: totalUserMsgsToday,
    _md: getTodayDateStr(),
  };
  localStorage.setItem(getKey(toolId), JSON.stringify(backup));
}

export function clearChat(toolId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getKey(toolId));
}

export function getLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${STORAGE_PREFIX}lang`) as Language | null;
}

export function setLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}lang`, lang);
}

export function getDailyMessageCount(): number {
  if (typeof window === "undefined") return 0;

  const backupCount = getBackupCount();

  try {
    const raw = localStorage.getItem(getTodayKey());
    if (!raw) return backupCount;
    const stored: StoredLimit = JSON.parse(raw);
    const dateStr = getTodayDateStr();
    const expectedChecksum = getChecksum(stored.c, dateStr);
    if (stored.s !== expectedChecksum) return Math.max(stored.c, backupCount);
    return Math.max(stored.c, backupCount);
  } catch {
    return backupCount;
  }
}

export function incrementDailyMessageCount(): number {
  const count = getDailyMessageCount() + 1;
  const dateStr = getTodayDateStr();
  const data: StoredLimit = {
    c: count,
    s: getChecksum(count, dateStr),
  };
  localStorage.setItem(getTodayKey(), JSON.stringify(data));
  return count;
}

export function getRemainingMessages(): number {
  return Math.max(0, DAILY_LIMIT - getDailyMessageCount());
}

export function canSendMessage(): boolean {
  return getDailyMessageCount() < DAILY_LIMIT;
}

export function resetDailyLimit(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getTodayKey());
}

export function createMessage(role: "user" | "assistant", content: string): Message {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}
