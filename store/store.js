import { create } from "zustand";

const useLoginStore = create((set) => ({
  isLoggedIn: false,
  token: "",
  id: undefined,
  setLoginDetails: (isLoggedInVal, tokenVal, idVal) =>
    set((state) => ({
      isLoggedIn: isLoggedInVal,
      token: tokenVal,
      id: idVal,
    })),
}));

export default useLoginStore;
