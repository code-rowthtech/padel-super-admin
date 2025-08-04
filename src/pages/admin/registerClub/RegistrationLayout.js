import React from 'react';
import { Container } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

const RegistrationLayout = ({ children, currentStep = 1 }) => {
    const steps = ['Venue Details', 'Images', 'Pricing'];

    return (
        <div
            style={{
                backgroundColor: '#ffffff',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 16px',
            }}
        >
            <Container>
                <h2 className="fw-bold text-center mb-4">Register Your Club</h2>

                <div
                    style={{
                        backgroundColor: '#F5F8FF',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        boxShadow: '0 0 12px rgba(0, 0, 0, 0.05)',
                        padding: '32px',
                        maxWidth: '1100px',
                        margin: '0 auto',
                    }}
                >
                    {/* Stepper */}
                    <div className="d-flex flex-column align-items-center mb-4">
                        <div className="d-flex justify-content-center align-items-center flex-wrap">
                            {steps.map((_, index) => {
                                const stepIndex = index + 1;
                                const isCompleted = stepIndex < currentStep;
                                const isActive = stepIndex === currentStep;

                                return (
                                    <React.Fragment key={stepIndex}>
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                border: '2px solid #2563eb',
                                                backgroundColor: isCompleted
                                                    ? '#2563eb'
                                                    : '#fff',
                                                color: isCompleted ? '#fff' : '#2563eb',
                                                position: 'relative',
                                            }}
                                        >
                                            {isCompleted ? (
                                                <FaCheck color="#fff" size={16} />
                                            ) : isActive ? (
                                                <div
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        backgroundColor: '#2563eb',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            ) : null}
                                        </div>

                                        {stepIndex < steps.length && (
                                            <div
                                                style={{
                                                    width: '260px',
                                                    height: '2px',
                                                    backgroundColor: isCompleted
                                                        ? '#2563eb'
                                                        : '#d1d5db',
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Labels */}
                        <div className="d-flex justify-content-center mt-2 flex-wrap">
                            {steps.map((label, index) => {
                                const stepIndex = index + 1;
                                const isActive = currentStep === stepIndex;

                                return (
                                    <div
                                        key={label}
                                        className="text-center"
                                        style={{
                                            width: '200px',
                                            fontSize: '13px',
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? '#2563eb' : '#000',
                                        }}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form content */}
                    {children}
                </div>
            </Container>
        </div>
    );
};

export default RegistrationLayout;
