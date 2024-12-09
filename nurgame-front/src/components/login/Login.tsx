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
                <div className="login__text">
                    <a href="/" className="login__text-title">
                        <img src="src/assets/images/loginpagelogo.svg" alt="Logo" />
                    </a>
                    <h1>India's First eCommerce</h1>
                    <h2>and Applied Marketing Academy</h2>
                    <p>Industry backed programs designed by professionals to accelerate your digital career.</p>
                    {error && <p className="login__error">{error}</p>}
                </div>
                <form className="login__form" onSubmit={handleSubmit}>
                    <div className="login__form-wrapper">
                        <div className="login__form-title">
                            <img src="src/assets/images/loginformlogo.svg" alt="Logo" />
                            <h1>Learner Login</h1>
                            <p>Sign In to your Account</p>
                        </div>
                        <div className="login__form-item">
                            <span className="login__form-item-text">Email ID</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your Email ID"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                            <span className="login__form-item-text">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your Password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__form-passwords">
                            <label className="login__form-passwords-check">
                                <input type="checkbox" />
                                <span>Remember Me</span>
                            </label>
                            <div className="login__form-passwords-forgot" onClick={handleForgotPassword}>
                                Forgot Password
                            </div>
                        </div>
                        <div className="login__form-submit">
                            <button type="submit">Login</button>
                            {error && <p className="error">{error}</p>}
                        </div>
                        <div className="login__form-link">
                            <p className="login__form-link-text">
                                Do not have an account?{' '}
                                <NavLink className="login__form-link-text-nav" to={Links.register}>
                                    Register
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
