/**
 * @deprecated This service is deprecated. Use Firebase Auth and userService instead.
 * 
 * Migration Guide:
 * - Use `signInWithEmailAndPassword` / `createUserWithEmailAndPassword` from 'firebase/auth'
 * - Use `getUserProfile` / `createUserProfile` / `updateUserProfile` from 'services/userService'
 * - Use `useAuth` hook to access current user and profile
 */

export const authService = {
  getDB: () => { throw new Error("authService is deprecated"); },
  getUser: () => { throw new Error("authService is deprecated"); },
  register: async () => { throw new Error("authService is deprecated"); },
  login: async () => { throw new Error("authService is deprecated"); },
  updateUser: () => { throw new Error("authService is deprecated"); },
  logout: () => { throw new Error("authService is deprecated"); }
};

export interface UserProfile {
  // Legacy type kept to prevent immediate build break if I missed any imports, 
  // but runtime access will fail.
  [key: string]: any;
}