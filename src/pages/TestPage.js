import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'red', 
      color: 'white', 
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>TEST PAGE - IF YOU SEE THIS, REACT IS WORKING</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{ 
          padding: '10px 20px', 
          fontSize: '18px', 
          backgroundColor: 'white', 
          color: 'red',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
    </div>
  );
};

export default TestPage;
