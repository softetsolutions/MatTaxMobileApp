// utils/auth.js
import useLoginStore from "../store/store";// path to your zustand store

export const getAuthInfo = () => {
  const { token, id } = useLoginStore.getState(); // get token and user ID from store
  if (!token) {
    return null; // user is not logged in
  }
  return { token, userId: id };
};
