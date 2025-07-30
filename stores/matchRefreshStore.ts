import { create } from 'zustand';

interface MatchRefreshState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useMatchRefreshStore = create<MatchRefreshState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
})); 