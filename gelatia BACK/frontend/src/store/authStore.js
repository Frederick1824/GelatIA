import { create } from "zustand";
import { clearSession, loadSession, saveSession } from "../utils/storage";

const initialSession = loadSession();

export const useAuthStore = create((set) => ({
  token: initialSession?.token ?? null,
  user: initialSession?.user ?? null,
  business: initialSession?.business ?? null,
  isReady: true,
  setSession: ({ token, user, business = null }) =>
    set(() => {
      const session = { token, user, business };
      saveSession(session);
      return session;
    }),
  patchBusiness: (business) =>
    set((state) => {
      const session = { token: state.token, user: state.user, business };
      saveSession(session);
      return { business };
    }),
  logout: () =>
    set(() => {
      clearSession();
      return {
        token: null,
        user: null,
        business: null,
      };
    }),
}));
