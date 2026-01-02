import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { USERS_COLLECTION } from '../utils/constants';
import { getUserProfile, updateUserProfile, createUserProfile, UserData } from '../services/userService';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserData | null;
    loading: boolean;
    isAdmin: boolean;
    updateUser: (data: Partial<UserData>) => Promise<void>;
    signup: (email: string, pass: string, name: string) => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    loading: true,
    isAdmin: false,
    updateUser: async () => { },
    signup: async () => { },
    login: async () => { },
    logout: async () => { }
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let profileUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    // Set up real-time listener for user profile
                    const userRef = doc(db, USERS_COLLECTION, user.uid);
                    profileUnsubscribe = onSnapshot(userRef, (doc) => {
                        if (doc.exists()) {
                            setUserProfile(doc.data() as UserData);
                        } else {
                            setUserProfile(null);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error('Error listening to user profile:', error);
                        setLoading(false);
                    });
                } catch (error) {
                    console.error('Error setting up profile listener:', error);
                    setUserProfile(null);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
                if (profileUnsubscribe) {
                    profileUnsubscribe();
                    profileUnsubscribe = null;
                }
            }
        });

        return () => {
            unsubscribe();
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }
        };
    }, []);

    const updateUser = async (data: Partial<UserData>) => {
        if (currentUser) {
            await updateUserProfile(currentUser.uid, data);
            setUserProfile(prev => prev ? { ...prev, ...data } : null);
        }
    };

    const signup = async (email: string, pass: string, name: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            // Create user profile in Firestore
            await createUserProfile(userCredential.user.uid, email, name);
        } catch (error) {
            console.error("Signup Error", error);
            throw error;
        }
    };

    const login = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Login Error", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout Error", error);
            throw error;
        }
    };


    const value = {
        currentUser,
        userProfile,
        loading,
        isAdmin: userProfile?.role === 'admin',
        updateUser,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
