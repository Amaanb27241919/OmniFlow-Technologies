import { ChatInteraction } from './chatService';

// In-memory storage for chat history with typed interface
interface HistoryStore {
  interactions: ChatInteraction[];
}

// Initialize history store
const historyStore: HistoryStore = {
  interactions: []
};

// Add a chat interaction to history
export function addToHistory(interaction: ChatInteraction): void {
  historyStore.interactions.push(interaction);
  
  // Keep history limited to the last 100 interactions for memory efficiency
  if (historyStore.interactions.length > 100) {
    historyStore.interactions = historyStore.interactions.slice(-100);
  }
}

// Get all chat history
export function getAllHistory(): ChatInteraction[] {
  return [...historyStore.interactions];
}

// Clear chat history
export function clearHistory(): void {
  historyStore.interactions = [];
}

// Get specific chat interaction by ID
export function getInteractionById(id: string): ChatInteraction | undefined {
  return historyStore.interactions.find(interaction => interaction.id === id);
}

// Export the history store for use in other modules
export { historyStore };