import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForms from './Auth/AuthForms';
import { isAdmin } from '../services/userService';

const LoginWrapper: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AuthForms onSuccess={async (user) => {
            const admin = await isAdmin(user.uid);
            if (admin) {
                navigate('/secure-access-shyam');
            } else {
                navigate('/dashboard');
            }
        }} />
    );
};

export default LoginWrapper;
