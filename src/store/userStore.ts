import { create } from 'zustand';

interface UserStore {
    userName: string | null;
    setUserName: (name: string) => void;
    clearUser: () => void;
    // Age gate and parental consent (mocked - no backend)
    age: number | null;
    setAge: (age: number) => void;
    parentalConsentGiven: boolean;
    setParentalConsentGiven: (given: boolean) => void;
    parentalConsentEmail: string | null;
    setParentalConsentEmail: (email: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    userName: null,
    setUserName: (name: string) => set({ userName: name }),
    clearUser: () => set({
        userName: null,
        age: null,
        parentalConsentGiven: false,
        parentalConsentEmail: null,
    }),
    // Age gate state
    age: null,
    setAge: (age: number) => set({ age }),
    // Parental consent state (mocked - will need backend verification)
    parentalConsentGiven: false,
    setParentalConsentGiven: (given: boolean) => set({ parentalConsentGiven: given }),
    parentalConsentEmail: null,
    setParentalConsentEmail: (email: string) => set({ parentalConsentEmail: email }),
}));


