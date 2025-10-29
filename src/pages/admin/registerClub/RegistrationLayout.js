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
                padding: '20px 8px',
            }}
        >
            <Container fluid className="px-2 px-md-3">
                <h2 className="fw-bold text-center mb-3 mb-md-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Register Your Club</h2>

                <div
                    className="mx-auto"
                    style={{
                        backgroundColor: '#F5F8FF',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        boxShadow: '0 0 12px rgba(0, 0, 0, 0.05)',
                        padding: 'clamp(16px, 4vw, 32px)',
                        maxWidth: '1100px',
                    }}
                >
                    {/* Stepper */}
                    <div className="mb-4">
                        {/* Desktop Stepper */}
                        <div className="d-none d-md-flex flex-column align-items-center">
                            <div className="d-flex justify-content-center align-items-center">
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

                            {/* Desktop Labels */}
                            <div className="d-flex justify-content-center mt-2">
                                {steps.map((label, index) => {
                                    const stepIndex = index + 1;
                                    const isActive = currentStep === stepIndex;

                                    return (
                                        <div
                                            key={label}
                                            className="text-center"
                                            style={{
                                                width: '300px',
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

                        {/* Mobile Stepper */}
                        <div className="d-block d-md-none">
                            {steps.map((label, index) => {
                                const stepIndex = index + 1;
                                const isCompleted = stepIndex < currentStep;
                                const isActive = stepIndex === currentStep;

                                return (
                                    <div key={stepIndex} className="d-flex align-items-center mb-3">
                                        <div
                                            className="d-flex justify-content-center align-items-center me-3"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: '2px solid #2563eb',
                                                backgroundColor: isCompleted
                                                    ? '#2563eb'
                                                    : '#fff',
                                                color: isCompleted ? '#fff' : '#2563eb',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {isCompleted ? (
                                                <FaCheck color="#fff" size={12} />
                                            ) : isActive ? (
                                                <div
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        backgroundColor: '#2563eb',
                                                        borderRadius: '50%',
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                                    {stepIndex}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: isActive ? 600 : 500,
                                                color: isActive ? '#2563eb' : isCompleted ? '#2563eb' : '#6b7280',
                                            }}
                                        >
                                            {label}
                                        </div>
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
