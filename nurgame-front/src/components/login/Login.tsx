import { useState, ChangeEvent } from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import { Links } from '../../models/Models';
import { jwtDecode } from 'jwt-decode';
import axiosConfig from "../../api/axiosConfig.ts";

interface LoginCredentials {
    email: string;
    password: string;
}

interface DecodedToken {
    id: string;
    email: string;
    role: string;
    exp: number; // Token expiration timestamp
}

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
    const [error, setError] = useState<string>('');
    // const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            const response = await axiosConfig.post("/auth/login", credentials);
            const token = response.data?.accessToken;
            const refreshToken = response.data?.refreshToken;
            console.log("Hello",response);
            console.log("POKA",token);

            if (token) {
                axiosConfig.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                localStorage.setItem("authToken", token);
                localStorage.setItem("refreshToken", refreshToken);

                const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
                navigate(decoded.role === "Tester" ? "/profile" : "/profile", { replace: true });
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (err) {
            setError("Login failed. Please check your credentials.");
            console.error(err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    const handleForgotPassword = () => {
        navigate(Links.forgotPassword);
    };

    return (
        <div className="login">
            <div className="login__wrapper">
                <div className="login__text" style={{ marginTop: '8rem' }}>
                    <h1 style={{ fontSize: '1.8rem' }}>Коррупция: цена слишком высока</h1>
                    <p>Коррупция приводит к бедности, неравенству и подрывает доверие к государству. Давайте объединим усилия, чтобы построить общество, свободное от коррупции.</p>
                    {error && <p className="login__error">{error}</p>}
                </div>
                <form className="login__form" onSubmit={handleSubmit}>
                    <div className="login__form-wrapper">
                        <div className="login__form-title">
                            <img src="src/assets/images/nurgameLogo.png" alt="Logo" />
                            <h1>Логин ученика</h1>
                            <p>Войдите в аккаунт</p>
                        </div>
                        <div className="login__form-item">
                            <span className="login__form-item-text">Почта</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Ваша почта"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                            <span className="login__form-item-text">Пароль</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Введите ваш пароль"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__form-passwords">
                            <label className="login__form-passwords-check">
                                <input type="checkbox" />
                                <span>Запомнить меня</span>
                            </label>
                            <div className="login__form-passwords-forgot" onClick={handleForgotPassword}>
                                Забыл пароль
                            </div>
                        </div>
                        <div className="login__form-submit">
                            <button type="submit">Войти</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                        <div className="login__form-link">
                            <p className="login__form-link-text">
                                Хотите создать аккаунт?{' '}
                                <NavLink className="login__form-link-text-nav" to={Links.register}>
                                    Регистрация
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
