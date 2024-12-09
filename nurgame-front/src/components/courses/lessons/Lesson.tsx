import React, { useState, useEffect } from "react";
import axiosConfig from "../../../api/axiosConfig.ts";
import DOMPurify from "dompurify";

const Lesson: React.FC = () => {
    const [lessons, setLessons] = useState<{ id: number; title: string; content: string; videoUrl: string }[]>([]);
    const [currentLesson, setCurrentLesson] = useState<{
        title: string;
        content: string;
        videoUrl: string;
    } | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true);
            try {
                const response = await axiosConfig.get("/course/3/modules/3/lessons");
                const data = response.data;
                console.log("FetchLessons data:", data);

                setLessons(data);

                if (data.length > 0) {
                    setCurrentLesson({
                        title: data[0].title,
                        content: data[0].content,
                        videoUrl: data[0].videoUrl,
                    });
                    setSelectedLessonId(data[0].id);
                }
            } catch (err) {
                console.error("Error fetching lessons:", err);
                setError("Failed to load lessons. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const handleLessonSelect = (lesson: { id: number; title: string; content: string; videoUrl: string }) => {
        setCurrentLesson(lesson);
        setSelectedLessonId(lesson.id);
    };

    return (
        <div className="lesson">
            {error && <p className="lesson__error">{error}</p>}
            {loading ? (
                <p>Loading lessons...</p>
            ) : (
                <>
                    <div className="lesson__left">
                        {/* Video Section */}
                        {currentLesson && (
                            <div className="lesson__video-section">
                                <video
                                    controls
                                    className="lesson__video"
                                    src={currentLesson.videoUrl}
                                    poster="path_to_poster.jpg"
                                ></video>
                                <div className="lesson__details">
                                    <h2>{currentLesson.title}</h2>
                                    <div
                                        className="lesson__details-content"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(currentLesson.content),
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="lesson__reviews">
                            <h3>Reviews</h3>
                            <form
                                className="lesson__form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const comment = (e.target as any).elements.comment.value;
                                    alert(`Review Submitted: ${comment}`);
                                    (e.target as any).reset();
                                }}
                            >
                                <textarea
                                    name="comment"
                                    placeholder="Leave a comment"
                                    className="lesson__textarea"
                                ></textarea>
                                <button type="submit" className="lesson__submit-button">
                                    Publish review
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lesson__right">
                        {/* Lessons List */}
                        <div className="lesson__sidebar">
                            <h3>Lessons</h3>
                            <ul className="lesson__list">
                                {lessons.map((lesson) => (
                                    <li
                                        key={lesson.id}
                                        className={`lesson__list-item ${
                                            lesson.id === selectedLessonId ? "selected" : ""
                                        }`}
                                        onClick={() => handleLessonSelect(lesson)}
                                    >
                                        <span>{lesson.title}</span>
                                        <input type="checkbox" className="lesson__checkbox" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Lesson;
