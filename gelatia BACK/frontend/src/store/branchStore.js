import { create } from "zustand";
import { clearBranch, loadBranch, saveBranch } from "../utils/storage";

const initialBranch = loadBranch();

export const useBranchStore = create((set) => ({
  activeBranch: initialBranch,
  setActiveBranch: (branch) =>
    set(() => {
      saveBranch(branch);
      return { activeBranch: branch };
    }),
  clearActiveBranch: () =>
    set(() => {
      clearBranch();
      return { activeBranch: null };
    }),
}));
