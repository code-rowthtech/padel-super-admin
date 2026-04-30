import React from 'react';
import { Card } from 'react-bootstrap';

const SkeletonCard = () => {
  return (
    <Card className="h-100" style={{ border: '1px solid #e5e7eb' }}>
      <Card.Body className="p-3">
        <div 
          className="mb-3 rounded" 
          style={{ 
            height: '20px', 
            backgroundColor: '#f3f4f6',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
        <div className="d-flex flex-column gap-2">
          <div 
            className="rounded" 
            style={{ 
              height: '40px', 
              backgroundColor: '#f3f4f6',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
          <div 
            className="rounded" 
            style={{ 
              height: '40px', 
              backgroundColor: '#f3f4f6',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </div>
      </Card.Body>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Card>
  );
};

export default SkeletonCard;
