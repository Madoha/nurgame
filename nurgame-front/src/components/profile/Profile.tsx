import {useState, useEffect, FormEvent} from 'react';
import {FaEllipsisV, FaCheck} from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode';
import {IChangePassword, IUser} from "../../models/Models.tsx";
import axiosConfig from "../../api/axiosConfig.ts";
import {io} from 'socket.io-client';

interface Course {
    title: string;
    instructor: string;
}

interface Message {
    sender: string;
    text: string;
    time: string;
    read: boolean;
    unreadCount?: number;
}

interface Achievement {
    name: string;
    description: string;
    reward: string;
    icon: string;
}

const socket = io('http://192.168.0.107:4001');

const Profile: React.FC = () => {
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const [changePassword, setChangePassword] = useState<IChangePassword>({} as IChangePassword);
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [achievement, setAchievement] = useState<Achievement>({} as Achievement);

    const courses: Course[] = [
        {title: 'E-commerce Excellence: Selling Smarter Online', instructor: 'Andy Stevanus'},
        {title: 'Influencer Marketing Insider', instructor: 'Brian Braun'},
        {title: 'Digital Dynamo: Unleash Your Online Potential', instructor: 'Chyntia Laura'},
        {title: 'SEO Wizardry: Ranking High in the Digital World', instructor: 'Dennise Khan'},
    ];

    const messages: Message[] = [
        {sender: 'Chloe Jess', text: 'I have done my task last week..', time: '15min ago', read: true},
        {sender: 'Geex UI Design Team', text: 'Don’t forget our daily report gu...', time: '2h ago', read: false},
        {sender: 'Roberto', text: 'Last week, do you remember?', time: '02:45 AM', read: true},
        {sender: 'Lisa Blekcurrent', text: 'My boss give me that task last..', time: '2 min ago', read: false},
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const {oldPassword, newPassword, confirmPassword} = changePassword;

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const response = await axiosConfig.post('/auth/change-password/', {
                oldPassword,
                newPassword,
            });

            setMessage(response.data.message);
            setChangePassword({oldPassword: '', newPassword: '', confirmPassword: ''});
        } catch (err) {
            setError('Password change failed. Please try again.');
            console.error('Change password error:', err);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setChangePassword({oldPassword: '', newPassword: '', confirmPassword: ''});
        setMessage('');
        setError('');
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            const token = localStorage.getItem('authToken');
            if (token) {
                axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                axiosConfig.post('/user/upload', formData)
                    .then(response => {
                        console.log('res', response.data.data.secure_url)
                        setUserInfo(response.data.data.secure_url);
                    })
                    .catch(error => {
                        console.error('Error uploading avatar:', error);
                    });
            }
        }
    };

    const handleAvatarClick = () => {
        const fileInput = document.getElementById("avatar-upload");
        if (fileInput) {
            fileInput.click(); // Триггерим клик
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }
                console.log('Auth Token:', token);

                // Decode token and set user info
                const decodedToken = jwtDecode<{ id: string; email: string; role: string }>(token);

                // Optionally set decoded token data directly to userInfo
                setUserInfo({
                    id: decodedToken.id,
                    email: decodedToken.email,
                    role: decodedToken.role
                });

                axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch additional profile info if needed
                const response = await axiosConfig.get(`/user/${decodedToken.id}`);
                setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    ...response.data.data, // Merge data from API
                }));

            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to fetch user profile.');
            }
        };

        fetchUserProfile();

        // socket.on('connect', () => {
        //     console.log('Socket connected:', socket.id);
        // });
        //
        // socket.on('achievementUnlocked', (data) => {
        //     console.log('Achievement data received:', data);
        //     setAchievement(data); // Сохраняем данные достижения
        //     setTimeout(() => setAchievement({} as Achievement), 5000);
        // });
        //
        // socket.on('disconnect', () => {
        //     console.log('Socket disconnected:', socket.id);
        // });
        //
        // return () => {
        //     socket.off('achievementUnlocked');
        // };
    }, []);


    return (
        <div className="profile">
            <div className="profile__wrapper">
                <div className="profile__part1">
                    {userInfo && (
                        <div className="profile__part1-profileCard">
                            <div className="profile__part1-profileCard-ava">
                                {/* Кликабельное изображение */}
                                <img
                                    className="profile__part1-ava-img"
                                    src={userInfo.avatarUrl || "https://via.placeholder.com/220"}
                                    alt="Profile"
                                    onClick={handleAvatarClick} // Привязываем событие клика
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        display: "block",
                                        margin: "0 auto",
                                        cursor: "pointer",
                                    }}
                                />

                                {/* Скрытое поле для загрузки файла */}
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    style={{display: "none"}}
                                    onChange={handleAvatarChange} // Обработчик изменения файла
                                    accept="image/*" // Только изображения
                                />
                            </div>
                            <div className="profile__part1-profileCard-cardInfo">
                                <div className="profile__part1-profileCard-cardInfo-info">
                                    <div className="profile__part1-profileCard-cardInfo-infoText">
                                        <div>
                                            <h1>{userInfo.lastName} {userInfo.username}</h1>
                                            <h3>{userInfo.username}</h3>
                                        </div>
                                        <div className="profile__part1-profileCard-cardInfo-changePasswordButton">
                                            {isModalOpen && (
                                                <>
                                                    {/* Overlay для затемнения фона */}
                                                    <div className="modal__overlay" onClick={closeModal}></div>

                                                    {/* Модальное окно */}
                                                    <div className="modal">
                                                        <div className="modal__content">
                                                            <button className="modal__close" onClick={closeModal}>
                                                                &times;
                                                            </button>
                                                            <form onSubmit={handleSubmit}>
                                                                <h3>Change Password</h3>
                                                                <div>
                                                                    <input
                                                                        type="password"
                                                                        placeholder="Current Password"
                                                                        value={changePassword.oldPassword}
                                                                        onChange={(e) =>
                                                                            setChangePassword({
                                                                                ...changePassword,
                                                                                oldPassword: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="password"
                                                                        placeholder="New Password"
                                                                        value={changePassword.newPassword}
                                                                        onChange={(e) =>
                                                                            setChangePassword({
                                                                                ...changePassword,
                                                                                newPassword: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="password"
                                                                        placeholder="Confirm New Password"
                                                                        value={changePassword.confirmPassword}
                                                                        onChange={(e) =>
                                                                            setChangePassword({
                                                                                ...changePassword,
                                                                                confirmPassword: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <button type="submit">Submit</button>
                                                                {message && <p>{message}</p>}
                                                                {error && <p style={{color: "red"}}>{error}</p>}
                                                            </form>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="profile__part1-profileCard-cardInfo-infoButtons">
                                        <button><img src='src/assets/images/infoo.svg' alt="Info"/></button>
                                        <button onClick={openModal}><img src='src/assets/images/editt.svg' alt="Edit"/>
                                        </button>
                                    </div>
                                </div>
                                <div className="profile__part1-profileCard-icons">
                                    <p><img src='/src/assets/images/email.svg' alt='Email'
                                            className="profile__icon"/>{userInfo.email}</p>
                                    <p><img src='/src/assets/images/phone.svg' alt='Phone Number'
                                            className="profile__icon"/>+7 (777) 777 77 77</p>
                                    <p><img src='/src/assets/images/educationIcon.svg' alt='Education'
                                            className="profile__icon"/>Astana IT University</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {achievement.name && (
                    <>
                        {/* Затемнённый фон */}
                        <div className="achievement-overlay" onClick={() => setAchievement({} as Achievement)}></div>

                        {/* Модальное окно с достижением */}
                        <div className="achievement-notification">
                            <div className="achievement-content">
                                <FaCheck className="achievement-icon"/>
                                <h2>{achievement.name}</h2>
                                <p>{achievement.description}</p>
                                <p>Reward: {achievement.reward}</p>
                                <img src={achievement.icon} alt="Achievement Icon" className="achievement-image"/>
                            </div>
                        </div>
                    </>
                )}

                <div className="profile__part2">
                    <div className="profile__part2-left">
                        <div className="profile__part2-left-courseText">
                            <div className="profile__part2-left-titles">
                                <h1>Subscribed Courses</h1>
                                <p>Maiores dicta atque dolorem temporibus</p>
                            </div>
                            <button><img src='src/assets/images/addIcon.svg' alt="Add"/></button>
                        </div>
                        <div className="profile__part2-left-section">
                            <ul className="profile__part2-left-section-list">
                                {courses.map((course, index) => (
                                    <li key={index} className="profile__part2-left-listItem">
                                        <div className="profile__listItemLeft">
                                            <img src={`https://via.placeholder.com/50`} alt="Course"
                                                 className="profile__avatar"/>
                                            <div className="profile__part2-left-listItem-opop">
                                                <h3 className="profile__courseTitle">{course.title}</h3>
                                                <p className="profile__instructor">{course.instructor}</p>
                                            </div>
                                        </div>
                                        <FaEllipsisV className="profile__icon"/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="profile__part2-right">
                        <div className="profile__part2-right-courseText">
                            <div>
                                <h1>Latest Message</h1>
                                <p>Maiores dicta atque dolorem temporibus</p>
                            </div>
                            <button><img src='src/assets/images/addIcon.svg' alt="Add"/></button>
                        </div>
                        <div className="profile__part2-right-section">
                            <ul className="profile__part2-right-list">
                                {messages.map((message, index) => (
                                    <li key={index} className="profile__part2-right-listItem">
                                        <div className="profile__part2-right-messageInfo">
                                            <img src={`https://via.placeholder.com/50`} alt="Sender"
                                                 className="profile__avatar"/>
                                            <div>
                                                <h3 className="profile__part2-right-sender">{message.sender}</h3>
                                                <p className="profile__part2-right-messageText">{message.text}</p>
                                            </div>
                                        </div>
                                        <div className="profile__part2-right-messageMeta">
                                            <span className="profile__part2-right-time">{message.time}</span>
                                            {message.read ? (
                                                <FaCheck className="profile__part2-right-icon"/>
                                            ) : message.unreadCount && (
                                                <span
                                                    className="profile__part2-right-unreadCount">{message.unreadCount}</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
