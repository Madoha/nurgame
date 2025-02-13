import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {Course} from "../../models/Models.tsx";
import axiosConfig from "../../api/axiosConfig.ts";

const Courses = () => {
    const [courses, setCourses] = useState<Course | null>(null);
    const [error, setError] = useState<string>("");
    const [courseCompleted, setCourseCompleted] = useState<boolean>(false);

    const currentXP = 13;
    const totalXP = 20;
    const progressPercentage = (currentXP / totalXP) * 100;

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axiosConfig.get("/course/3/");
                const data = response.data;

                setCourses(data);
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError("Failed to load courses. Please try again.");
            }
        };

        fetchCourses();
    }, []);

    // Handle completing the course and issuing a certificate
    const handleCompleteCourse = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');

            // Send GET request to complete the course
            const response = await axiosConfig.get(
                "https://c273-5-34-4-103.ngrok-free.app/api/course/3/complete"
            );

            if (response.status === 200) {
                // Successfully completed the course
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
        <div className="courses">
            {error && <p className="error-message">{error}</p>}
            <div className="courses__wrapper">
                <div className="courses__wrapper-test">
                    {courses ? (
                        <div>
                            {courses.modules.map((module) => (
                                <div key={module.id} className="courses__wrapper-test-unit">
                                    <div className="courses__wrapper-test-unitParts">
                                        <div className="courses__wrapper-test-units">
                                            <div className="courses__wrapper-test-units-text">
                                                <h1>{module.title}</h1>
                                                <p>{module.description}</p>
                                            </div>
                                        </div>
                                        <div className="courses__wrapper-test-steps">
                                            <div className="courses__wrapper-test-steps-stepsBtns">
                                                {/* Lesson Links */}
                                                {module.lessons.map((lesson) => (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/course/3/module/${module.id}/lesson/${lesson.id}`}
                                                        className="lesson-button"
                                                    >
                                                        <img
                                                            className="courses__wrapper-test-steps-stepsBtns-img"
                                                            src={lesson.icon}
                                                            alt="Lesson Info"
                                                        />
                                                    </Link>
                                                ))}
                                                {/* Test Icon */}
                                                <Link
                                                    to={`/course/3/module/${module.id}/tests`}
                                                    className="test-button"
                                                    title="Go to Test"
                                                >
                                                    <img
                                                        className="courses__wrapper-test-steps-stepsBtns-img"
                                                        src="src/assets/icons/test.png"
                                                        alt="Test Icon"
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="loading-overlay">
                            <p>Loading modules...</p>
                        </div>
                    )}
                </div>
                <div className="courses__wrapper-information">
                    <div className="courses__wrapper-information-btn">
                        <button onClick={handleCompleteCourse} disabled={courseCompleted}>
                            {courseCompleted ? "Course Completed" : "Закончить курс"}
                        </button>
                    </div>
                    <div className="courses__wrapper-information-xp">
                        <div className="courses__wrapper-information-xp-progressBar">
                            <div className="courses__wrapper-information-xp-progressBar-title">
                                <h1>XP Progress</h1>
                                <a>EDIT GOAL</a>
                            </div>
                            <div className="courses__wrapper-information-xp-progressBar-bar">
                                <img src="src/assets/images/xpChest.svg" alt=""/>
                                <div className="courses__wrapper-information-xp-progressBar-bar-progress">
                                    <p>Daily Goal</p>
                                    <div className="courses__wrapper-information-xp-progressBar-bar-progress-t">
                                        <div
                                            className="courses__wrapper-information-xp-progressBar-bar-progress-bar"
                                            style={{
                                                "--progress-width": `${progressPercentage}%`,
                                            }}
                                        ></div>
                                        <p>
                                            {currentXP}/{totalXP}XP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Courses;
