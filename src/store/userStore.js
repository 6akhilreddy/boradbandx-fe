import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData, token) =>
        set({
          user: {
            ...userData,
          },
        }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-store", // Key for storage
      storage: createJSONStorage(() => localStorage), // Fix for storage type error
    }
  )
);

export default useUserStore;
