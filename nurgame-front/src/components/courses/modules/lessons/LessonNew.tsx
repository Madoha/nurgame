import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Lessons} from "../../../../models/Models.tsx";
import axiosConfig from "../../../../api/axiosConfig.ts";

const LessonNew = () => {
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
        <div className="lessonNew-page">
            <h1 className="lessonNew__title">{lesson.title}</h1>

            <div className="lessonNew__fullContent">
                <div className="lessonNewLeft">
                    {/* Video Section */}
                    <div className="lessonNew__video-section">
                        {lesson.type === "video" && (
                            <iframe
                                src={lesson.videoUrl}
                                title={lesson.title}
                                className="lessonNew__video"
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
                </div>

                {/* Lesson Details */}
                <div className="lessonNew__details">
                    <h2>Подробности урока</h2>
                    {/* Render Content */}
                    <div
                        className="lessonNew__content"
                        dangerouslySetInnerHTML={{__html: lesson.content}}
                    ></div>
                </div>

                {/* Comment Section */}
                <div className="lessonNew__comments-section">
                    <h2>Комментарии</h2>
                    <div className="lessonNew__comments">
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="lessonNew__comment">
                                    {comment}
                                </div>
                            ))
                        ) : (
                            <p>Комментариев пока нет. Оставляйте комментарии первыми!</p>
                        )}
                    </div>
                    <div className="lessonNew__add-comment">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Напишите комментарий..."
                        className="lessonNew__comment-input"
                    ></textarea>
                        <button onClick={handleAddComment} className="lessonNew__comment-button">
                            Добавить комментарий
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonNew;
