import {useState, ChangeEvent} from 'react';
import axiosConfig from "../../api/axiosConfig.ts";
import {IChangePassword, Links} from "../../models/Models.tsx";
import {useNavigate} from "react-router-dom";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Track the current step in the process
    const [changePassword, setChangePassword] = useState<IChangePassword>({oldPassword: '', newPassword: '', confirmPassword: ''}); // New password input
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name === "oldPassword" || name === "newPassword" || name === "confirmPassword") {
            setChangePassword((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const { oldPassword, newPassword, confirmPassword } = changePassword;

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            console.log('Token', token);

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;


            const response = await axiosConfig.post('/auth/change-password/', {
                oldPassword,
                newPassword,
                confirmPassword,
            });
            setMessage(response.data.message);
        } catch (error) {
            setError('Password change failed. Please try again.');
            console.error('Change password error:', error);
        }
    };

    const handleBack = () => {
        navigate(Links.login);
    };

    // Render the form based on the current step
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <div>
                            <div className="login__forgotForm-title">
                                <img src="src/assets/images/loginformlogo.svg" alt="Logo"/>
                                <h1>Reset Password</h1>
                                <p>Set a new password for your account.</p>
                            </div>
                            <div className="login__forgotForm-item">
                                <span className="login__forgotForm-item-text">Old Password</span>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    placeholder="Enter your Old Password"
                                    value={changePassword?.oldPassword || ""}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="login__forgotForm-item-text">New Password</span>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Enter your New Password"
                                    value={changePassword?.newPassword || ""}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="login__forgotForm-item-text">Confirm New Password</span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your New Password"
                                    value={changePassword?.confirmPassword || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="login__forgotForm-btns">
                            <button
                                type="button"
                                className="login__forgotForm-btns-backbtn"
                                onClick={handleBack} // Switch back to Login form
                            >
                            Cancel
                            </button>
                            <button
                                type="submit"
                                className="login__forgotForm-btns-submitbtn"
                            >Submit
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2>Success!</h2>
                        <p>{message}</p>
                        <button onClick={() => window.location.href = '/login'}>Back to Login</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="login">
            <div className="login__wrapper">
                <div className="login__text">
                    <a href="/" className="login__text-title">
                        <img src="src/assets/images/loginpagelogo.svg" alt="Logo"/>
                    </a>
                    <h1>India's First eCommerce</h1>
                    <h2>and Applied Marketing Academy</h2>
                    <p>Industry backed programs designed by <br/>
                        professionals to accelerate your digital career.</p>
                    {error && <p className="login__error">{error}</p>}
                    {message && <p className="login__message">{message}</p>}
                </div>
                <form className="login__forgotForm" onSubmit={handleSubmit}>
                    <div className="login__forgotForm-wrapper">
                        {renderStepContent()}
                        {step < 2 && (
                            <div>
                                {step > 1 && (
                                    <button type="button" onClick={() => setStep(step - 1)}>
                                        Back
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
