import React from "react";
import {useNavigate} from "react-router-dom";
import axiosConfig from "../../api/axiosConfig.ts";
import {Http} from "../../models/Models.tsx";

interface SignOutProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

const SignOut: React.FC<SignOutProps> = ({showModal, setShowModal}) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        console.log("Sign-out button clicked");
        try {
            const response = await axiosConfig.post(Http.logout);
            console.log("Sign-out response:", response);
            if (response.status === 200) {
                localStorage.removeItem("refreshToken");
                console.log("Helllo suka: ", response);
                setShowModal(false);
                navigate("/login");
            } else {
                console.error("Sign-out failed with status:", response.status);
            }
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    };

    return (
        <>
            {showModal && (
                <div className="modal__overlay">
                    <div className="modal">
                        <div className="modal__content">
                            <h2>Выйти?</h2>
                            <p>Вы уверены, что хотите выйти из системы?</p>
                            <div className="modal__content-buttons">
                                <button className="cancel-button" style={{color: 'black'}} onClick={() => setShowModal(false)}>
                                    Назад
                                </button>
                                <button className="signout-button" onClick={handleSignOut}>
                                    Выйти
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SignOut;
