import { useState, ChangeEvent } from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import axios from "axios";
import {Http, ILoginCredentials, Links} from '../../models/Models';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<ILoginCredentials>({ email: '', password: '' });
    const [errors, setErrors] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const addTokenToHeaders = (token: string) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const handleLogin = async (credentials: ILoginCredentials) => {
        try {
            const response = await axios.post(Http.baseURL + Http.login, credentials);
            const accessToken = response.data;
            console.log(accessToken);
            if (accessToken) {
                addTokenToHeaders(accessToken);
                return { token: accessToken };
            } else {
                throw new Error('Token not received');
            }
        } catch (errors) {
            console.error('Login error', errors);
            throw errors;
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const { token } = await handleLogin(credentials);
            console.log('Login successful: ', token.accessToken);
            localStorage.setItem('authToken', token.accessToken);
            navigate(Links.profile);
        } catch (errors) {
            setErrors('Login failed. Please check your credentials.');
            console.error('Login error', errors);
        }
    };

    const handleForgotPassword = () => {
        navigate(Links.forgotPassword);
    };

    return (
        <div className="testLogin">
            <div className="testLogin__wrapper">
                <form className="testLogin__form" onSubmit={handleSubmit}>
                    <div className="testLogin__form-wrapper">
                        <div className="testLogin__form-title">
                            <h1>Login</h1>
                            <p>Sign In to your Account</p>
                        </div>
                        <div className="testLogin__form-item">
                            <span className="testLogin__form-item-text">Email ID</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your Email ID"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                            <span className="testLogin__form-item-text">Password</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your Password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="testLogin__form-passwords">
                            <label className="testLogin__form-passwords-check">
                                <input type="checkbox" />
                                <span>Remember Me</span>
                            </label>
                            <div className="testLogin__form-passwords-forgot" onClick={handleForgotPassword}>
                                Forgot Password
                            </div>
                        </div>
                        <div className="testLogin__form-submit">
                            <button type="submit">Login</button>
                            {errors && <p className="testLogin__form-submit-error">{errors}</p>}
                        </div>
                        <div className="testLogin__form-link">
                            <p className="testLogin__form-link-text">
                                <NavLink className="testLogin__form-link-text-nav" to={Links.register}>
                                    Do not have an account?{' '}Register
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
