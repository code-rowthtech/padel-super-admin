import React from "react";
import "./StepProgressTabs.css";
import { MdOutlineArrowDropDown } from "react-icons/md";

const StepProgressTabs = ({
    steps = [],
    activeStep = 0,
    onStepChange,
    allowStepClick = true,
}) => {
    const handleStepClick = (index) => {
        if (!allowStepClick) return;
        onStepChange?.(index);
    };

    return (
        <div className="step-wrapper">
            {steps.map((step, index) => {
                const isActive = index <= activeStep;
                const isCompleted = index < activeStep;

                return (
                    <div className="step-item" key={index}>
                        <div
                            className={`step-circle 
                ${isActive ? "active" : ""} 
                ${isCompleted ? "completed" : ""}`}
                            onClick={() => handleStepClick(index)}
                        >
                            {isCompleted ? "✓" : index + 1}
                        </div>
                        <MdOutlineArrowDropDown className={`mb-0 ${isActive ? 'text-primary' : 'text-secondary'}`} size={20} />

                        <div
                            className={`step-label 
                ${isActive ? "active-label" : ""}`}
                        >
                            {step}
                        </div>

                        {index !== steps.length - 1 && (
                            <div
                                className={`step-line 
                  ${index < activeStep ? "line-completed" : ""}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepProgressTabs;