import React from 'react';

const Test = () => {
  return (
    <div>
      {/* Create Plan Tab */}
      {true && (
        <>
          <h1>Title</h1>
          <p>Description</p>
          <div>
            <p>Content</p>
          </div>
        </>
      )}
      
      {/* Progress Tab */}
      {true && (
        <div>
          <h1>Progress</h1>
        </div>
      )}
    </div>
  );
};

export default Test;