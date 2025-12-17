import { create } from 'zustand';

interface AvatarStore {
    selectedAvatar: string | null;
    setAvatar: (id: string) => void;
    clearAvatar: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
    selectedAvatar: null,
    setAvatar: (id: string) => set({ selectedAvatar: id }),
    clearAvatar: () => set({ selectedAvatar: null }),
}));









