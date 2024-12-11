import {useEffect, useState} from 'react';
import SignOut from "../signmethods/SignOut.tsx";
import {useNavigate} from "react-router-dom";
import axiosConfig from "../../api/axiosConfig.ts";
import {jwtDecode} from 'jwt-decode';
import {IUser} from "../../models/Models.tsx";


interface CoursesData {
    completed: number;
    inProgress: number;
    certificatesEarned: number;
    achievements: number;
}

interface UnfinishedCourse {
    id: number;
    title: string;
    duration: string;
    instructor: string;
}

interface PopularCourse {
    id: number;
    title: string;
    price: string;
    instructor: string;
    startDate: string;
}

interface CommunityGroup {
    id: number;
    name: string;
    members: number;
    privacy: string;
}

interface Activity {
    id: number;
    description: string;
    action: string;
}

interface StatCardProps {
    title: string;
    count: number;
    progress: number;
    icon: string;
}

interface UCourseCardProps {
    ucourse: UnfinishedCourse;
}

interface PCourseCardProps {
    pcourse: PopularCourse;
}

interface CommunityCardProps {
    group: CommunityGroup;
}

interface ActivityCardProps {
    activity: Activity;
}

// Dummy Data for Demonstration Purposes

const mockCoursesData: CoursesData = {
    completed: 0,
    inProgress: 0,
    certificatesEarned: 0,
    achievements: 1,
};

const mockCoursesDataIcon = {
    icon1: '/src/assets/images/progressIcon1.svg',
    icon2: '/src/assets/images/progressIcon2.svg',
    icon3: '/src/assets/images/progressIcon3.svg',
    icon4: '/src/assets/images/progressIcon4.svg',
};

const mockUnfinishedCourses: UnfinishedCourse[] = [
    {
        id: 1,
        title: "Игра гонка",
        duration: "72 min",
        instructor: "Dianne Edwards"
    },
    {id: 2, title: "Игра стеклами", duration: "82 min", instructor: "Dianne Edwards"},
    {id: 3, title: "Игра учитель", duration: "91 min", instructor: "Dianne Edwards"},
];

const mockPopularCourses: PopularCourse[] = [
    {
        id: 1,
        title: "Digital Marketing Ethics: Navigating the Ethical Landscape",
        price: "$159",
        instructor: "Evan Lindsey",
        startDate: "17 April"
    },
    {
        id: 2,
        title: "Pay-Per-Click Powerhouse: Crafting Profitable Campaigns",
        price: "$159",
        instructor: "Roger Hamilton",
        startDate: "19 April"
    },
];

const mockCommunityGroups: CommunityGroup[] = [
    {id: 1, name: "We The Feast", members: 48, privacy: "Private"},
    {id: 2, name: "We The Feast", members: 26, privacy: "Public"},
    {id: 3, name: "We The Feast", members: 48, privacy: "Private"},
    {id: 4, name: "We The Feast", members: 26, privacy: "Public"},
];

const mockActivity: Activity[] = [
    {id: 1, description: "2 assignments pending of eCommerce Basics", action: "Send A"},
    {id: 2, description: "2 assignments pending of eCommerce Basics", action: "Send A"},
];

// Main Dashboard Component
const Home: React.FC = () => {
    const [userData, setUserData] = useState<IUser | null>(null);
    const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
    const [unfinishedCourses, setUnfinishedCourses] = useState<UnfinishedCourse[]>([]);
    const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
    const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCoursesData(mockCoursesData);
        setUnfinishedCourses(mockUnfinishedCourses);
        setPopularCourses(mockPopularCourses);
        setCommunityGroups(mockCommunityGroups);
        setActivities(mockActivity);

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (token) {
                    // Decode the token to get user ID or relevant data
                    const decodedToken: any = jwtDecode(token);

                    axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Fetch user data from your API using axiosConfig
                    const userResponse = await axiosConfig.get(`/user/${decodedToken.id}`);
                    setUserData(userResponse.data.data);
                    // Fetch other necessary data
                    // const coursesResponse = await axiosConfig.get("/courses");
                    // const unfinishedResponse = await axiosConfig.get("/unfinishedCourses");
                    // const popularResponse = await axiosConfig.get("/popularCourses");
                    // const communityResponse = await axiosConfig.get("/communityGroups");
                    // const activityResponse = await axiosConfig.get("/activities");

                    // setCoursesData(coursesResponse.data);
                    // setUnfinishedCourses(unfinishedResponse.data);
                    // setPopularCourses(popularResponse.data);
                    // setCommunityGroups(communityResponse.data);
                    // setActivities(activityResponse.data);

                    setIsLoggedIn(true);
                } else {
                    // Token not found, user is not logged in
                    setIsLoggedIn(false);
                    console.error('Token not found, user is not logged in.');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoggedIn(false); // Ensure UI reflects the lack of authentication
            }
        };
        fetchData();
    }, []);

    const toggleDropdown = () => setShowDropdown((prev) => !prev);

    const handleLoginRedirect = () => navigate('/login');
    const handleRegisterRedirect = () => navigate('/register');

    return (
        <div className="dashboard">
            <div className="dashboard__wrapper">
                <div className="dashboard__part1">
                    <div className="dashboard__part1-header">
                        <div className="dashboard__part1-welcome">
                            {isLoggedIn && userData ? (
                                <>
                                    <p>Hello {userData.firstName} {userData.lastName}, Welcome back.</p>
                                    <h1>Your Dashboard today</h1>
                                </>
                            ) : (
                                <>
                                    <p>Hello, Welcome to our platform.</p>
                                    <h1>Please Login or Register</h1>
                                </>
                            )}
                        </div>
                        <div className="dashboard__part1-profile">
                            {isLoggedIn && userData ? (
                                <div onClick={toggleDropdown}>
                                    <img src={userData.avatarUrl} alt="Profile"/>
                                    <span>{userData.username}</span>
                                    {showDropdown && (
                                        <div className={`dashboard__dropdown ${showDropdown ? 'show' : ''}`}>
                                            <a href="/profile">
                                                <button>Profile</button>
                                            </a>
                                            <button onClick={() => setShowSignOutModal(true)}>Sign Out</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="dashboard__auth-buttons">
                                    <button onClick={handleLoginRedirect}>Login</button>
                                    <button onClick={handleRegisterRedirect}>Register</button>
                                </div>
                            )}
                            {/* Pass the modal control state */}
                            <SignOut showModal={showSignOutModal} setShowModal={setShowSignOutModal} />
                        </div>
                    </div>

                    <div className="dashboard__part1-stats">
                        {coursesData && (
                            <>
                                <StatCard title="Законченные модули" count={coursesData.completed} progress={0}
                                          icon={mockCoursesDataIcon.icon1}/>
                                <StatCard title="Модули в прогрессе" count={coursesData.inProgress} progress={0}
                                          icon={mockCoursesDataIcon.icon2}/>
                                <StatCard title="Получен сертификат" count={coursesData.certificatesEarned}
                                          progress={0} icon={mockCoursesDataIcon.icon3}/>
                                <StatCard title="Достижения" count={coursesData.achievements} progress={10}
                                          icon={mockCoursesDataIcon.icon4}/>
                            </>
                        )}
                    </div>
                </div>

                <div className="dashboard__part2">
                    <div className="dashboard__part2-header">
                        <div className="dashboard__part2-section">
                            <div className="dashboard__part2-left">
                                <h3>Наши мини игры</h3>
                                <button>See All</button>
                            </div>
                            <div className="dashboard__part2-course-list">
                                {unfinishedCourses.map(course => (
                                    <UCourseCard key={course.id} ucourse={course}/>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard__part2-section">
                            <div className="dashboard__part2-right">
                                <h3>My Community</h3>
                                <div className="dashboard__part2-community-list">
                                    {communityGroups.map(group => (
                                        <CommunityCard key={group.id} group={group}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard__part3">
                    <div className="dashboard__part3-header">
                        <div className="dashboard__part3-section1">
                            <div className="dashboard__part3-left">
                                <h3>Popular Courses</h3>
                                <button>See All</button>
                            </div>
                            <div className="dashboard__part3-course-list">
                                {popularCourses.map(course => (
                                    <PCourseCard key={course.id} pcourse={course}/>
                                ))}
                            </div>
                        </div>
                        <div className="dashboard__part3-section2">
                            <div className="dashboard__part3-right">
                                <h3>Activity</h3>
                                <div className="dashboard__part3-activity-list">
                                    {activities.map(activity => (
                                        <ActivityCard key={activity.id} activity={activity}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

// Individual Components for Dashboard Items
const StatCard: React.FC<StatCardProps> = ({icon, title, count, progress}) => (
    <div className="stat-card">
        <div className="stat-card__context">
            <div className="stat-card__icon">
                <img src={icon} alt={title}/>
            </div>
            <div className="stat-card__data">
                <div className="stat-card__data-count">{count}</div>
                <div className="stat-card__data-title">{title}</div>
            </div>
        </div>
        <div className="stat-card__progress-bar">
            <div
                className="stat-card__progress-bar__progress"
                style={{width: `${progress}%`}}
            ></div>
            <span className="stat-card__progress-bar__percentage">{progress}%</span>
        </div>
    </div>
);

const UCourseCard: React.FC<UCourseCardProps> = ({ucourse}) => (
    <div className="course-card">
        <div className="course-card__content">
            {/* <img src="src/assets/images/yourAva.svg" alt="avatar"/> */}
            {/* <p className="course-card__instructor">{ucourse.instructor}</p> */}
            <p className="course-card__details">
                Длительность {ucourse.duration}
            </p>
        </div>
        <div className="course-card__description">
            <p className="course-card__title">{ucourse.title}</p>
        </div>
    </div>
);

const PCourseCard: React.FC<PCourseCardProps> = ({pcourse}) => (
    <div className="pcourse-card">
        <div className="pcourse-card__title">
            <img src="src/assets/images/ava.svg" alt="Logo"/>
            <div className="pcourse-card__content">
                <p className="pcourse-card__instructor">{pcourse.instructor}</p>
                <p className="pcourse-card__details">
                    {pcourse.startDate}
                </p>
                <p className="pcourse-card__price">
                    {pcourse.price}
                </p>
            </div>
        </div>
        <div className="pcourse-card__description">
            <p className="pcourse-card__title">{pcourse.title}</p>
        </div>
    </div>
);

const CommunityCard: React.FC<CommunityCardProps> = ({group}) => (
    <div className="community-card">
        <img src="src/assets/images/ava.svg" alt="Logo"/>
        <div className="community-card__content">
            <h5 className="community-card__name">{group.name}</h5>
            <p className="community-card__members">{group.members} Members</p>
        </div>
        <p className="community-card__privacy">{group.privacy}</p>
    </div>
);

const ActivityCard: React.FC<ActivityCardProps> = ({activity}) => (
    <div className="activity-card">
        <div className="activity-card__content">
            <img src="src/assets/images/activityIcon.svg" alt="Activity Icon"/>
            <p className="activity-card__description">{activity.description}</p>
        </div>
        <div className="activity-card__btns">
            <button className="activity-card__action1">Dismiss</button>
            <button className="activity-card__action2">Send Activity</button>
        </div>
    </div>
);

export default Home;
