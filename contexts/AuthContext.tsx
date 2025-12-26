import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { getUserProfile, updateUserProfile, UserData } from '../services/userService';

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserData | null;
    loading: boolean;
    isAdmin: boolean;
    updateUser: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    loading: true,
    isAdmin: false,
    updateUser: async () => { }
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
                    const userRef = doc(db, 'users', user.uid);
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

    const value = {
        currentUser,
        userProfile,
        loading,
        isAdmin: userProfile?.role === 'admin',
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
