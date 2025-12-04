import React, { useRef } from 'react';
import { copyMatchCardWithScreenshot } from '../utils/matchCopy';

const MatchCopyTest = () => {
  const testCardRef = useRef(null);

  const testMatch = {
    matchDate: '2024-12-04',
    slot: [
      {
        slotTimes: [
          { time: '10:00 AM', amount: 1000 }
        ]
      }
    ],
    clubId: {
      clubName: 'Test Padel Club'
    },
    skillLevel: 'intermediate'
  };

  const handleCopy = async () => {
    if (testCardRef.current) {
      await copyMatchCardWithScreenshot(testCardRef.current, testMatch);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Match Copy Test</h3>
      <div 
        ref={testCardRef}
        style={{
          backgroundColor: '#CBD6FF1A',
          border: '1px solid #0000001A',
          borderRadius: '8px',
          padding: '16px',
          margin: '16px 0',
          width: '300px'
        }}
      >
        <h4>Test Match Card</h4>
        <p>Date: 04 Dec</p>
        <p>Time: 10AM</p>
        <p>Club: Test Padel Club</p>
        <p>Level: Intermediate</p>
        <p>Price: ₹1000</p>
      </div>
      <button 
        onClick={handleCopy}
        style={{
          background: 'linear-gradient(180deg, #0034E4 0%, #001B76 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer'
        }}
      >
        Copy Match Card
      </button>
    </div>
  );
};

export default MatchCopyTest;