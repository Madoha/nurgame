import { useState, ChangeEvent } from 'react';
import axiosConfig from "../../api/axiosConfig.ts";
import { IForgotPassword, Links } from "../../models/Models.tsx";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [forgotPassword, setForgotPassword] = useState<IForgotPassword>({ email: '' }); // Email state
    const [error, setError] = useState<string>(''); // Error message state
    const [message, setMessage] = useState<string>(''); // Success message state
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "email") {
            setForgotPassword((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { email } = forgotPassword;

        try {
            const response = await axiosConfig.post('/auth/forgot-password/', { email });
            setMessage(response.data.message); // Show success message if response is successful
            setError(''); // Clear error message if the request was successful
        } catch (error) {
            setError('Password reset failed. Please try again.'); // Display error message if request fails
            setMessage(''); // Clear success message if the request fails
            console.error('Error:', error);
        }
    };

    // Handle back button click to navigate to login
    const handleBack = () => {
        navigate(Links.login);
    };

    return (
        <div className="login">
            <div className="login__wrapper">
                <div className="login__text" style={{ marginTop: '4rem' }}>
                    <h1 style={{ fontSize: '1.8rem' }}>Борьба с коррупцией</h1>
                    <p>Коррупция – это зло, подрывающее основы общества. Просвещение и образование являются ключевыми инструментами в борьбе с этим явлением. Давайте вместе создавать прозрачное и честное будущее.</p>
                    {error && <p className="login__error">{error}</p>}
                </div>
                <form className="login__forgotForm" onSubmit={handleSubmit}>
                    <div className="login__forgotForm-wrapper">
                        <div>
                            <div className="login__forgotForm-title">
                                <img src="src/assets/images/nurgameLogo.png" alt="Logo" />
                                <h1>Забыл пароль</h1>
                                <p>Измени пароль для своего аккаунта</p>
                            </div>
                            <div className="login__forgotForm-item">
                                <span className="login__forgotForm-item-text">Почта</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Введите вашу почту"
                                    value={forgotPassword?.email || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {message && <p className="login__message">{message}</p>}
                            </div>
                        </div>
                        <div className="login__forgotForm-btns">
                            <button
                                type="button"
                                className="login__forgotForm-btns-backbtn"
                                onClick={handleBack} // Switch back to Login form
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="login__forgotForm-btns-submitbtn"
                            >
                                Изменить
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
