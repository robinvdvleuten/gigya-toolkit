/* eslint-env browser */
import React from 'react';
import { render } from 'react-dom';

const ScreenSetList = ({ gigya, screenSets }) => {
  const handleScreenSetClick = screenSetId => {
    gigya.accounts.showScreenSet({
      screenSet: screenSetId,
    });
  };

  return (
    <div>
      <ul>
        {Object.keys(screenSets).map(screenSetId => (
          <li key={screenSetId}>
            <button onClick={() => handleScreenSetClick(screenSetId)}>
              {screenSetId}
            </button>
          </li>
        ))}
      </ul>
      {Object.keys(screenSets).map(screenSetId => (
        <div key={screenSetId} id={screenSetId}>
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
