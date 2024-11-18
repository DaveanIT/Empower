import React from 'react';

const Notfound = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div style={{ textAlign: 'center', color: '#6c757d' }}>
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: '#dc3545',
            animation: 'pulseRotate 1.5s infinite',
          }}
          className="error-404"
        >
          404
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '20px' }}>
          Site Can't Be Reached
        </h1>
        <p style={{ fontSize: '1.25rem' }}>
          The page you are trying to access is currently unavailable.
        </p>
        <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
          You do not have the authority to access this site.
        </p>
      </div>
      <style>
        {`
          @keyframes pulseRotate {
            0% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
            25% {
              transform: scale(1.1) rotate(-10deg);
              opacity: 0.8;
            }
            50% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
            75% {
              transform: scale(1.1) rotate(10deg);
              opacity: 0.8;
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Notfound;
