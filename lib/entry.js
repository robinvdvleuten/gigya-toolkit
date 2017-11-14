/* eslint-env browser */
import React from 'react';
import { render } from 'react-dom';

const ScreenSetList = ({ gigya, screenSets }) => {
  const handleScreenSetClick = screenSetId => {
    gigya.accounts.showScreenSet({
      screenSet: screenSetId,
      containerID: 'gigya-container',
    });
  };

  return (
    <div>
      <nav className="navbar sticky-top navbar-expand-lg navbar-light bg-light">
        <span className="navbar-brand mb-0 mr-auto h1">
          Gigya Toolkit
        </span>
        <ul className="navbar-nav">
          {Object.keys(screenSets).map(screenSetId => (
            <li key={screenSetId} className="nav-item">
              <button className="btn btn-primary btn-sm" onClick={() => handleScreenSetClick(screenSetId)}>
                {screenSetId}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div id="gigya-container" />
      {Object.keys(screenSets).map(screenSetId => (
        <div key={screenSetId} id={screenSetId} style={{ display: 'none' }}>
          {screenSets[screenSetId].default()}
        </div>
      ))}
    </div>
  );
};

render(
  <ScreenSetList gigya={window.gigya} screenSets={window.screenSets} />,
  document.getElementById('root')
);
