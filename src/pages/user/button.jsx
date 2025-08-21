import React from 'react';

const CustomButton = () => {
  // Mock props for demonstration
  const width = 370;
  const height = 75;
  const circleRadius = height * 0.3;
  // Calculate the center of the curved end section more precisely
  const curvedSectionStart = width * 0.76; // Where the curve starts
  const curvedSectionEnd = width * 0.996; // Where the curve ends
  const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1; // Added 1 pixel to the right
  const circleY = height * 0.5;
  const arrowSize = circleRadius * 0.6;
  const arrowX = circleX;
  const arrowY = circleY;
  
  const buttonStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    overflow: 'visible',
  };

  const svgStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    color: 'white',
    fontWeight: '600',
    fontSize: `16px`,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingRight: `${circleRadius * 2}px`,
  };

  const onClick = () => {
    alert('Button clicked! (would navigate to /payment)');
  };

  // Mock Link component since we don't have react-router-dom
  const Link = ({ to, children, style, className }) => (
    <div style={style} className={className}>
      {children}
    </div>
  );

  return (
    <div className="d-flex justify-content-center mt-3 sticky-bottom bg-white d-md-none d-block rounded-top-5" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <button
        style={buttonStyle}
        onClick={onClick}
        className=""
      >
        <Link to="/payment" style={{ textDecoration: 'none' }} className="">
          <svg
            style={svgStyle}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3DBE64" />
                <stop offset="50%" stopColor="#1F41BB" />
                <stop offset="100%" stopColor="#1F41BB" />
              </linearGradient>
            </defs>

            {/* Main button shape - responsive to dimensions */}
            <path
              d={`M ${width * 0.76} ${height * 0.15} 
             C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} 
             C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} 
             C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} 
             C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} 
             C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} 
             C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} 
             C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} 
             C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} 
             C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} 
             C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} 
             L ${width * 0.08} ${height * 0.85} 
             C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} 
             C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} 
             L ${width * 0.76} ${height * 0.15} Z`}
              fill={`url(#buttonGradient-${width}-${height})`}
            />

            {/* Green circle - properly positioned and sized */}
            <circle
              cx={circleX}
              cy={circleY}
              r={circleRadius}
              fill="#3DBE64"
            />

            {/* Arrow icon - scaled proportionally */}
            <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
              <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
              <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
            </g>
          </svg>

          <div style={contentStyle}>
            Book Now
          </div>
        </Link>
      </button>
    </div>
  );
};

export default CustomButton;