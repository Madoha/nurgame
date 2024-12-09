import {useState} from "react";
import Graph from "./Graph.tsx";

const Courses = () => {
    // State to track which step is unlocked for each unit
    const [unlockedSteps, setUnlockedSteps] = useState({
        1: 0, // Initially, only the first step of Unit 1 is unlocked
        2: 0,
        3: 0,
    });

    const currentXP = 13; // Current XP
    const totalXP = 20; // Total XP required
    const progressPercentage = (currentXP / totalXP) * 100;

    const units = [
        {
            id: 1,
            name: "Unit 1",
            description: "Form basic sentences, greet people",
            bgColor: "#58CC02",
            steps: [
                {id: 1, image: "src/assets/images/step1unit1.svg", alt: "Step 1"},
                {id: 2, image: "src/assets/images/step2unit1.svg", alt: "Step 2"},
                {id: 3, image: "src/assets/images/step3unit1.svg", alt: "Step 3"},
                {id: 4, image: "src/assets/images/step4unit1.svg", alt: "Step 4"},
                {id: 5, image: "src/assets/images/step5unit1.svg", alt: "Step 5"},
                {id: 6, image: "src/assets/images/step6unit1.svg", alt: "Step 6"},
            ],
            character: "src/assets/images/Duo the Owl.svg",
        },
        {
            id: 2,
            name: "Unit 2",
            description: "Get around in a city",
            bgColor: "#CE82FF",
            steps: [
                {id: 1, image: "src/assets/images/step1unit2.svg", alt: "Step 1"},
                {id: 2, image: "src/assets/images/step2unit1.svg", alt: "Step 2"},
                {id: 3, image: "src/assets/images/step3unit1.svg", alt: "Step 3"},
                {id: 4, image: "src/assets/images/step4unit1.svg", alt: "Step 4"},
                {id: 5, image: "src/assets/images/step5unit1.svg", alt: "Step 5"},
                {id: 6, image: "src/assets/images/step6unit1.svg", alt: "Step 6"},
            ],
            character: "src/assets/images/unit2pidr.svg",
            character2: "src/assets/images/unit2pidr2.svg",
        },
        {
            id: 3,
            name: "Unit 3",
            description: "Order food and drink",
            bgColor: "#00CD9C",
            steps: [
                {id: 1, image: "src/assets/images/step1unit3.svg", alt: "Step 1"},
                {id: 2, image: "src/assets/images/step2unit1.svg", alt: "Step 2"},
                {id: 3, image: "src/assets/images/step3unit1.svg", alt: "Step 3"},
                {id: 4, image: "src/assets/images/step4unit1.svg", alt: "Step 4"},
                {id: 5, image: "src/assets/images/step5unit1.svg", alt: "Step 5"},
                {id: 6, image: "src/assets/images/step6unit1.svg", alt: "Step 6"},
            ],
            character: "src/assets/images/unit3pidr.svg",
            character2: "src/assets/images/unit3pidr2.svg",
        },
    ];

    const handleStepClick = (unitId, stepIndex) => {
        // Check if the step is unlocked
        if (stepIndex === unlockedSteps[unitId]) {
            setUnlockedSteps((prev) => ({
                ...prev,
                [unitId]: prev[unitId] + 1, // Unlock the next step for this unit
            }));
            alert(`Test for Unit ${unitId}, Step ${stepIndex + 1} opened!`);
        }
    };

    return (
        <div className="courses">
            <div className="courses__wrapper">
                <div className="courses__wrapper-test">
                    {units.map((unit) => (
                        <div key={unit.id} className="courses__wrapper-test-unit">
                            {/* Unit Header */}
                            <div className="courses__wrapper-test-units" style={{backgroundColor: unit.bgColor}}>
                                <div className="courses__wrapper-test-units-text">
                                    <h1>{unit.name}</h1>
                                    <p>{unit.description}</p>
                                </div>
                                <button className="courses__wrapper-test-units-btn"
                                        style={{backgroundColor: unit.bgColor}}>
                                    <img src={"src/assets/images/coursesGuideBook.svg"} alt={""}/>
                                    GuideBook
                                </button>
                            </div>

                            {/* Unique Steps for the Unit */}
                            <div className="courses__wrapper-test-steps">
                                <div className="courses__wrapper-test-steps-pidr">
                                    <img src={unit.character2} alt={""}
                                         className="courses__wrapper-test-steps-pidr-pidr2"/>
                                </div>
                                <div className="courses__wrapper-test-steps-stepsBtns">
                                    {unit.steps.map((step, index) => (
                                        <button
                                            key={step.id}
                                            className={`step-button ${
                                                index <= unlockedSteps[unit.id] ? "active" : "disabled"
                                            }`}
                                            onClick={() => handleStepClick(unit.id, index)}
                                            disabled={index > unlockedSteps[unit.id]}
                                        >
                                            <img src={step.image} alt={step.alt} className="step-icon"/>
                                        </button>
                                    ))}
                                </div>
                                <div className="courses__wrapper-test-steps-pidr">
                                    <img src={unit.character} alt={""}
                                         className="courses__wrapper-test-steps-pidr-pidr1"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="courses__wrapper-information">
                    <div className="courses__wrapper-information-xp">
                        <div className="courses__wrapper-information-xp-progressBar">
                            <div className="courses__wrapper-information-xp-progressBar-title">
                                <h1>XP Progress</h1>
                                <a>EDIT GOAL</a>
                            </div>
                            <div className="courses__wrapper-information-xp-progressBar-bar">
                                <img src={"src/assets/images/xpChest.svg"} alt={""}/>
                                <div className="courses__wrapper-information-xp-progressBar-bar-progress">
                                    <p>Daily Goal</p>
                                    <div className="courses__wrapper-information-xp-progressBar-bar-progress-t">
                                        <div
                                            className="courses__wrapper-information-xp-progressBar-bar-progress-bar"
                                            style={{ '--progress-width': `${progressPercentage}%` }}
                                        ></div>
                                        <p>{currentXP}/{totalXP}XP</p>
                                    </div>
                                </div>
                            </div>
                            <Graph />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Courses;