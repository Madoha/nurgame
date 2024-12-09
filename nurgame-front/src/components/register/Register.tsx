import {useState, ChangeEvent, FormEvent} from 'react';
import {useNavigate, NavLink} from 'react-router-dom';
import {IUser, Links} from '../../models/Models.tsx';
import axiosConfig from "../../api/axiosConfig.ts";

function Register() {
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser>({} as IUser);
    const [step, setStep] = useState<number>(1); // Step tracking

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setUser((prevState) => ({...prevState, [name]: value}));
    };

    const handleNext = () => {
        if (step === 1 && (!user.firstName || !user.lastName || !user.username)) {
            alert("Please fill out all fields before proceeding.");
            return;
        }
        setStep(step + 1);
    };

    const handlePrevious = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log('Submitting user data:', user);
        try {
            const response = await axiosConfig.post('/auth/signup', user);
            alert(response.data.message);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Registration error', error);
        }
    };

    return (
        <div className="register">
            <div className="register__wrapper">
                <div className="register__text">
                    <a href="/" className="register__text-title">
                        <img src="src/assets/images/loginpagelogo.svg" alt="Logo"/>
                    </a>
                    <h1>India's First eCommerce</h1>
                    <h2>and Applied Marketing Academy</h2>
                    <p>
                        Industry backed programs designed by professionals to accelerate your digital career.
                    </p>
                </div>

                <form className="register__form" onSubmit={handleSubmit}>
                    <div className="register__form-wrapper">
                        <div className="register__form-title">
                            <img src="src/assets/images/loginformlogo.svg" alt="Logo"/>
                            <h1>Learner Register</h1>
                            <p>{step === 1 ? "Step 1: Basic Information" : "Step 2: Account Details"}</p>
                        </div>


                        {step === 1 && (
                            <div className="register__form-step1">
                                <div className="register__form-item">
                                    <span className="register__form-item-text">Firstname</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={user.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="register__form-item-text">Lastname</span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={user.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="register__form-item-text">Username</span>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        value={user.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="register__form-navigation">
                                    <button type="button" onClick={handleNext}>
                                        Submit
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="register__form-step2">
                            <span className="register__form-arrow" onClick={handlePrevious}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="#2D2F91"
                                    strokeWidth="2"
                                    className="register__form-arrow-icon"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </span>
                                <div className="register__form-item">
                                    <span className="register__form-item-text">Email ID</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="register__form-item-text">Password</span>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={user.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="register__form-item-text">Confirm Password</span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={user.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="register__form-navigation">
                                    <button type="submit">Submit</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="register__form-link">
                        <p className="register__form-link-text">
                            Already have an account?
                            <NavLink className="register__form-link-text-nav" to={Links.login}>
                                Login
                            </NavLink>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
