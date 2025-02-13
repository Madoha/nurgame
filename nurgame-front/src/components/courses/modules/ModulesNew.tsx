import {Course, Modules} from "../../../models/Models.tsx";
import {useEffect, useState} from "react";
import axiosConfig from "../../../api/axiosConfig.ts";
import {Link, useLocation} from "react-router-dom";
import {io} from "socket.io-client";
import {Simulate} from "react-dom/test-utils";
import progress = Simulate.progress;

const socket = io('http://192.168.0.107:4001');

interface Achievement {
    name: string;
    description: string;
    reward: string;
    icon: string;
}

const ModulesNew = () => {
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string>("");
    const [selectedModule, setSelectedModule] = useState<Modules | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [courseCompleted, setCourseCompleted] = useState<boolean>(false);
    const [canComplite, setCanComplite] = useState<boolean>(false);
    const [achievement, setAchievement] = useState<Achievement>({} as Achievement);
    const location = useLocation();
    const [testScore, setTestScore] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);

    const handleLesson = (module: Modules) => {
        setSelectedModule(module);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedModule(null);
    };


    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axiosConfig.get("/course/3/");
                const data = response.data;

                const canResponse = await axiosConfig.get("/course/3/can-complete");
                const complite = canResponse.data.data;

                setCourse(data);
                setCanComplite(complite)

                const score = location.state?.score || 0;
                const progressPercentage = location.state?.progress || 0; // Получение процента
                setTestScore(score);
                setProgress(progressPercentage); // Установка прогресса
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to load courses. Please try again.");
            }
        };

        fetchCourses();

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('achievementUnlocked', (data) => {
            console.log('Achievement data received:', data);
            setAchievement(data); // Сохраняем данные достижения
            setTimeout(() => setAchievement({} as Achievement), 500000000);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });

        return () => {
            socket.off('achievementUnlocked');
        };
    }, [location.state]);

    const handleCompleteCourse = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Send GET request to complete the course
            const response = await axiosConfig.get(
                "/course/3/complete"
            );

            if (response.status === 200) {
                console.log("Course completed successfully", response.data);
                setCourseCompleted(true);
            } else {
                console.error("Failed to complete course", response.data);
                setError("Failed to complete the course. Please try again.");
            }
        } catch (err) {
            console.error("Error completing course:", err);
            setError("Failed to complete the course. Please try again.");
        }
    };

    return (
        <div className={"modulesNew"}>
            <div className={"modulesNew__wrapper"}>
                {error && <p className="error-message">{error}</p>}
                <div className={"modulesNew__content"}>
                    <div className={"modulesNew__content-header"}>
                        <div className={"modulesNew__content-header-title"}>
                            <h1>Значение обучения борьбе с коррупцией: основы и важность</h1>
                            <p>Существует множество онлайн-курсов, посвящённых борьбе с коррупцией, которые охватывают
                                различные аспекты этой проблемы. Для начинающих, заинтересованных в понимании основ
                                антикоррупционной деятельности, полезно начать с курса, который обучает принципам
                                выявления и предотвращения коррупции, а также знакомит с основными методами её борьбы.
                                Изучение таких тем крайне важно, поскольку оно помогает формировать у граждан осознание
                                их роли в поддержании честности и справедливости в обществе.</p>
                        </div>
                        <div className={"modulesNew__content-header-submit"}>
                            <button
                                onClick={handleCompleteCourse}
                                className={`complete-button ${canComplite ? 'completed' : 'incomplete'}`}
                            >
                                {canComplite ? 'Завершить' : 'Незавершено'}
                            </button>
                        </div>
                    </div>
                    <div className={"modulesNew__content-main"}>
                        {course ? (
                            <div className={"modulesNew__content-main-cards"}>
                                {
                                    course.modules.map((module) => (
                                        <Card key={module.id} module={module} onLessonClick={handleLesson}/>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="loading-overlay">
                                <p>Loading modules...</p>
                            </div>
                        )}
                    </div>
                </div>
                <Modal module={selectedModule} onClose={closeModal}/>
                {achievement.name && (
                    <>
                        {/* Затемнённый фон */}
                        <div className="achievement-overlay" onClick={() => setAchievement({} as Achievement)}></div>

                        {/* Модальное окно с достижением */}
                        <div className="achievement-notification">
                            <div className="achievement-content">
                                <h2>{achievement.name}</h2>
                                <p>{achievement.description}</p>
                                <p>Награда: {achievement.reward}</p>
                                <img src={achievement.icon} alt="" className="achievement-image"/>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const Card: React.FC<{ module: Modules; onLessonClick: (module: Modules) => void }> = ({module, onLessonClick}) => {
    // const totalQuestions = module.tests?.[0]?.questions?.length || 0;
    // const progress = (testScore / totalQuestions) * 100; // Calculate percentage

    return (
        <div className="moduleCard1" onClick={() => onLessonClick(module)}>
            <div className="moduleCard">
                <div className="moduleCard-wrapper">
                    <div className="moduleCard-top">
                        <div className="moduleCard-header">
                            <span>{`#${module.id}`}</span>
                            {/*{locked && <img src="path-to-lock-icon.svg" alt="Lock Icon"/>}*/}
                        </div>
                    </div>
                    <div className="moduleCard-bottom">
                        <div className="moduleCard-body">
                            <h3>{module.title}</h3>
                        </div>
                        <div className="moduleCard-footer">
                            <div className="progress-bar">
                                <div
                                    className="progress"
                                    style={{width: `${progress}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button className="moduleCard-button">
                {module.lessons.length > 0 ? "Просмотр уроков" : "Скоро будет"}
            </button>
        </div>
    );
};

const Modal: React.FC<{ module: Modules | null; onClose: () => void }> = ({module, onClose}) => {
    if (!module) return null;

    return (
        <div className="modalNew">
            <div className="modalNew-content">
                <button className="modalNew-close" onClick={onClose}>
                    &times;
                </button>
                <h2>{module.title}</h2>
                <div className="modalNew-lessons">
                    {module.lessons.map((lesson) => (
                        <Link
                            key={lesson.id}
                            to={`/course/3/module/${module.id}/lesson/${lesson.id}`}
                            className="modalNew-lessons-item"
                        >
                            <div className="modalNew-lessons-title">
                                <img src={lesson.icon} alt={""}/>
                                <h3>{lesson.title}</h3>
                            </div>
                            <p>{lesson.type}</p>
                        </Link>
                    ))}
                    {/* Test Icon */}
                    <Link
                        to={`/course/3/module/${module.id}/tests`}
                        className="modalNew-lessons-item"
                    >
                        <div className={"modalNew-lessons-title"}>
                            <img
                                className="courses__wrapper-test-steps-stepsBtns-img"
                                src="src/assets/icons/test.png"
                                alt="Test Icon"
                            />
                            <h3>Тест</h3>
                        </div>
                        <p>test</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};


export default ModulesNew;