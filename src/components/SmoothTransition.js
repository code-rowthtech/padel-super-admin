import React, { useEffect, useState } from 'react';

const SmoothTransition = ({ children, loading = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`transition-container ${isVisible ? 'fade-in' : 'fade-out'}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </div>
  );
};

export default SmoothTransition;