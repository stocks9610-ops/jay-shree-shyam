import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import { STRATEGIES_COLLECTION } from '../utils/constants';
import { Strategy } from '../types';

export const useStrategies = () => {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, STRATEGIES_COLLECTION), orderBy('roi', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const fetchedStrategies: Strategy[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Strategy));

                setStrategies(fetchedStrategies);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching strategies:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { strategies, loading, error };
};
