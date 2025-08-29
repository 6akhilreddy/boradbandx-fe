import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (userData, token) => {
        console.log("Setting user data:", userData);
        console.log("Setting token:", token);
        set({
          user: {
            ...userData,
            // Ensure we have the role and permission information
            role: userData.role || userData.Role?.name,
            roleCode: userData.roleCode || userData.Role?.code,
            allowedFeatures: userData.allowedFeatures || [],
            companyId: userData.companyId,
          },
          token,
        });
        console.log("User store updated:", get());
      },

      clearUser: () => {
        console.log("Clearing user data");
        set({ user: null, token: null });
      },

      // Authentication state - changed from getter to function
      isAuthenticated: () => {
        const { user, token } = get();
        const authenticated = !!(user && token);
        console.log("Checking authentication:", {
          user: !!user,
          token: !!token,
          authenticated,
        });
        return authenticated;
      },

      // Helper methods for role checking
      hasPermission: (permission) => {
        const { user } = get();
        if (!user || !user.allowedFeatures) return false;
        return user.allowedFeatures.includes(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user || !user.roleCode) return false;
        return user.roleCode === role;
      },

      isSuperAdmin: () => get().hasRole("SUPER_ADMIN"),
      isAdmin: () => get().hasRole("ADMIN"),
      isAgent: () => get().hasRole("AGENT"),

      // Get user's company ID
      getCompanyId: () => {
        const { user } = get();
        return user?.companyId;
      },

      // Get user's role code
      getRoleCode: () => {
        const { user } = get();
        return user?.roleCode;
      },

      // Logout function
      logout: () => {
        console.log("Logging out user");
        set({ user: null, token: null });
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
