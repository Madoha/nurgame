    import {useNavigate, useParams} from "react-router-dom";
    import {useEffect, useState} from "react";
    import axiosConfig from "../../../../api/axiosConfig.ts";
    import {Answers, Links, Questions, Score, Test} from "../../../../models/Models.tsx";

    const defaultScore: Score = {
        testScore: 0,
    };

    const TestNew = () => {
        const {moduleId} = useParams<{ moduleId: string }>();
        const [test, setTest] = useState<Test | null>(null);
        const [userAnswers, setUserAnswers] = useState<Record<number, number | null>>({});
        const [error, setError] = useState<string>("");
        const [submitted, setSubmitted] = useState<boolean>(false);
        const [score, setScore] = useState<Score>(defaultScore);
        const navigate = useNavigate();

        useEffect(() => {
            const fetchTest = async () => {
                try {
                    const response = await axiosConfig.get(`/course/3/modules/${moduleId}/tests/`);
                    const testData = response.data; // Extract the test data

                    console.log("API Response:", testData); // Debug API response

                    const transformedTest: Test = {
                        questions: testData.tests.map((testItem: any) => ({
                            id: testItem.id,
                            text: testItem.text,
                            answers: testItem.answers.map((answer: any) => ({
                                id: answer.id,
                                text: answer.text,
                                isCorrect: answer.isCorrect,
                                questionId: answer.questionId
                            }))
                        }))
                    };

                    console.log("Transformed Test:", transformedTest); // Debug transformed test

                    const initialAnswers: Record<number, number | null> = {};
                    transformedTest.questions.forEach((question) => {
                        initialAnswers[question.id] = null;
                    });

                    setUserAnswers(initialAnswers);
                    setTest(transformedTest);
                } catch (err) {
                    console.error("Error fetching test:", err);
                    setError("Failed to load test. Please try again.");
                }
            };

            fetchTest();
        }, [moduleId]);

        const handleAnswerChange = (questionId: number, answerId: number) => {
            setUserAnswers((prev) => ({...prev, [questionId]: answerId}));
        };

        const handleBackToModule = () => {
            navigate(Links.modules);
        }

        const handleSubmit = async () => {
            if (!test) return;

            let correctCount = 0;

            // Calculate the number of correct answers
            test.questions.forEach((question) => {
                const selectedAnswerId = userAnswers[question.id];
                const correctAnswer = question.answers.find((answer) => answer.isCorrect);

                if (correctAnswer && correctAnswer.id === selectedAnswerId) {
                    correctCount++;
                }
            });

            const totalQuestions = test.questions.length;
            const progressPercentage = (correctCount / totalQuestions) * 100;

            // Set the score
            setScore(correctCount);
            console.log("Progress: ", progressPercentage);
            setSubmitted(true);

            // Prepare data to submit to the backend as testScore
            const dataToSubmit = {
                testScore: correctCount, // Send the score as testScore
            };

            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('No authentication token found');

                axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Make a POST request to submit the score
                const response = await axiosConfig.post(
                    `/course/3/modules/${moduleId}/complete`,
                    dataToSubmit
                );

                if (response.status === 200) {
                    console.log("Test submitted successfully", response.data);
                } else {
                    console.error("Failed to submit the test", response.data);
                }
            } catch (err) {
                console.error("Error submitting test:", err);
                setError("Failed to submit the test. Please try again.");
            }
            navigate(Links.modules, { state: { score: correctCount, progress: progressPercentage } });
        };


        if (error) return <p className="error-message">{error}</p>;
        if (!test) return <p className="loading-overlay">Loading test...</p>;

        return (
            <div className="testNew">
                {submitted ? (
                    <div className="testNew__fullResults">
                        <div className="testNew__results">
                            <h1>Результаты теста</h1>
                            <h3>
                                Вы набрали {score} балл из {test.questions.length}.
                            </h3>
                        </div>
                        <button onClick={handleBackToModule} className="testNew__form-submitBtn">Назад к модулям</button>
                    </div>
                ) : (
                    <div>
                        <div className="testNew__title">
                            <h1>Прохождение Теста</h1>
                            <h3>Общее количевство вопросов: {test.questions.length}</h3>
                        </div>
                        <div className="testNew__sides">
                            <div className="sidebar">
                                {Array.from({length: test.questions.length}).map((_, index) => (
                                    <div key={index}>
                                        <div className="line"></div>
                                        <div className="circle"></div>
                                        <div className="line"></div>
                                    </div>
                                ))}
                            </div>
                            <form className="testNew__form">
                                {test.questions.map((question: Questions) => (
                                    <div key={question.id} className="testNew__form-questions">
                                        <h2>{question.text}</h2>
                                        <div className="testNew__form-answers">
                                            {question.answers.map((answer: Answers) => (
                                                <div key={answer.id} className="testNew__form-answer">
                                                    <input
                                                        type="radio"
                                                        id={`question-${question.id}-answer-${answer.id}`}
                                                        name={`question-${question.id}`}
                                                        value={answer.id}
                                                        checked={userAnswers[question.id] === answer.id}
                                                        onChange={() => handleAnswerChange(question.id, answer.id)}
                                                    />
                                                    <label htmlFor={`question-${question.id}-answer-${answer.id}`}>
                                                        {answer.text}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="testNew__form-submitBtn"
                                    disabled={Object.values(userAnswers).includes(null)}
                                >
                                    Отправить
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default TestNew;
