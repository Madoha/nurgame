import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Lessons} from "../../../../models/Models.tsx";
import axiosConfig from "../../../../api/axiosConfig.ts";

const LessonPage = () => {
    const {moduleId, lessonId} = useParams<{ moduleId: string; lessonId: string }>();
    const [lesson, setLesson] = useState<Lessons | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState<string>("");

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                axiosConfig.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

                const response = await axiosConfig.get(
                    `/course/3/modules/${moduleId}/lessons/`
                );

                const lessonData = response.data.find(
                    (lesson: Lessons) => lesson.id.toString() === lessonId
                );

                if (!lessonData) {
                    throw new Error("Lesson not found");
                }

                setLesson(lessonData);
            } catch (err) {
                console.error("Error fetching lesson:", err);
                setError("Failed to load lesson. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [moduleId, lessonId]);

    const handleAddComment = () => {
        if (newComment.trim()) {
            setComments((prevComments) => [...prevComments, newComment.trim()]);
            setNewComment("");
        }
    };

    if (loading) return (<div className="loading-overlay">
        <p>Загрузка урока...</p>
    </div>);
    if (error) return <p className="error-message">{error}</p>;
    if (!lesson) return <p>Урок не найден</p>;

    return (
        <div className="lesson-page">
            <h1 className="lesson__title">{lesson.title}</h1>

            <div className="lessonLeft">
                {/* Video Section */}
                <div className="lesson__video-section">
                    {lesson.type === "video" && (
                        <iframe
                            src={lesson.videoUrl}
                            title={lesson.title}
                            className="lesson__video"
                            allowFullScreen
                        ></iframe>
                    )}
                    {lesson.type === "interactive" && (
                        // If the game is local, use a <Link> to navigate to the game page
                        <Link to={lesson.videoUrl} className="game-button">
                            Go to Game
                        </Link>
                    )}

                </div>
                {/* Comment Section */}
                <div className="lesson__comments-section">
                    <h2>Комментарии</h2>
                    <div className="lesson__comments">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="lesson__comment">
                                    {comment}
                                </div>
                            ))
                        ) : (
                            <p>Комментариев пока нет. Оставляйте комментарии первыми!</p>
                        )}
                    </div>
                    <div className="lesson__add-comment">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Напишите комментарий..."
                        className="lesson__comment-input"
                    ></textarea>
                        <button onClick={handleAddComment} className="lesson__comment-button">
                            Добавить комментарий
                        </button>
                    </div>
                </div>
            </div>

            {/* Lesson Details */}
            <div className="lesson__details">
                <h2>Подробности урока</h2>
                {/* Render Content */}
                <div
                    className="lesson__content"
                    dangerouslySetInnerHTML={{__html: lesson.content}}
                ></div>
            </div>
        </div>
    );
};

export default LessonPage;
