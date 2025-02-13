import React, { useState, useEffect } from 'react';
import axiosConfig from "../../api/axiosConfig.ts";  // предполагаем, что axios настроен
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
    const { token } = useParams();  // Получаем токен из URL
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await axiosConfig.post(`/auth/reset-password/${token}`, {
                newPassword,
                confirmNewPassword,
            });
            navigate('/login')
            setMessage(response.data.message);
            setError(''); // очищаем ошибки
        } catch (error) {
            navigate('/login')
            setError('Failed to reset password. Please try again.');
            setMessage(''); // очищаем сообщение об успехе
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');

        axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, [token]);

    return (
        <div>
            <h1>Reset Password</h1>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;
