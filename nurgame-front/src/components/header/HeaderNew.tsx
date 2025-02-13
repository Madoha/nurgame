import {IUser, Links} from "../../models/Models.tsx";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosConfig from "../../api/axiosConfig.ts";
import {jwtDecode} from "jwt-decode";
import SignOut from "../signmethods/SignOut.tsx";

const HeaderNew = () => {
    const [streak, setStreak] = useState<number>(0);
    const [coins, setCoins] = useState<number>(0);
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const [error, setError] = useState<string>("");
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toggleDropdown = () => setShowDropdown((prev) => !prev);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const decodedToken = jwtDecode<{ id: string; email: string; role: string }>(token);

                // Optionally set decoded token data directly to userInfo
                setUserInfo({
                    id: decodedToken.id,
                    email: decodedToken.email,
                    role: decodedToken.role
                });

                axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const streakResponse = await axiosConfig.get(`/user/${decodedToken.id}/streak`);
                const coinsResponse = await axiosConfig.get(`/user/${decodedToken.id}/coins`);

                setStreak(streakResponse.data.data || 0);
                setCoins(coinsResponse.data.data || 0);
                setIsLoggedIn(true);
            } catch (err) {
                setIsLoggedIn(false);
                console.error("Error fetching streak or coins:", err);
                setError("Failed to fetch user data.");
            }
        };

        fetchData();
    }, []);

    return (
        <div className={"headerNew"}>
            <div className={"headerNew__wrapper"}>
                <div className={"headerNew__content"}>
                    <div className={"headerNew__content-left"}>
                        <a href={Links.home}>
                            <img src={"src/assets/newImages/mainLogo.svg"} alt={""}
                                 className={"headerNew__content-left-mainLogo"}/>
                        </a>
                        <div className="headerNew__content-left-nav">
                            <a href={Links.home}
                               className={`headerNew__content-left-nav-item ${isActive(Links.home) ? 'active' : ''}`}>Домой</a>
                            <a href={Links.modules}
                               className={`headerNew__content-left-nav-item ${isActive(Links.courses) ? 'active' : ''}`}>Модули</a>
                            <a href={Links.contacts}
                               className={`headerNew__content-left-nav-item ${isActive(Links.contacts) ? 'active' : ''}`}>Контакты</a>
                            <a href={Links.about}
                               className={`headerNew__content-left-nav-item ${isActive(Links.about) ? 'active' : ''}`}>О
                                нас</a>
                        </div>
                    </div>
                    <div className={"headerNew__content-right"}>
                        <div className="headerNew__content-right-rewards">
                            {/* Coins Section */}
                            <div className="headerNew__content-right-rewards-coins">
                                <img src="src/assets/newImages/coins.svg" alt="Coins" className="header__icon"/>
                                <p>{coins}</p>
                            </div>
                            {/* Streak Section */}
                            <div className="headerNew__content-right-rewards-streak">
                                <img src="src/assets/newImages/streak.svg" alt="Streak" className="header__icon"/>
                                <p>{streak}</p>
                            </div>

                        </div>
                        <div className={"headerNew__content-right-logs"}>
                            {isLoggedIn && userInfo ? (
                                <div>
                                    <button>
                                        <a href={Links.profile}>Профиль</a>
                                    </button>
                                    <button style={{color: 'white'}} onClick={() => setShowSignOutModal(true)}>Выйти</button>
                                </div>
                            ) : (
                                <div>
                                    <button>
                                        <a href={Links.login}>Логин</a>
                                    </button>
                                    <button>
                                        <a href={Links.register}>Регистрация</a>
                                    </button>
                                </div>
                            )}
                            <SignOut showModal={showSignOutModal} setShowModal={setShowSignOutModal}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderNew;