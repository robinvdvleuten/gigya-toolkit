const request = require('request-promise');

function setScreenSet(screenSetId, env) {
  return request.post(`https://accounts.${env.region}.gigya.com/accounts.setScreenSet`, {
    form: {
      apiKey: env.apiKey,
      secret: env.secret,
      screenSetID: screenSetId,
      html: env.screenSets[screenSetId].markup,
      css: env.screenSets[screenSetId].styles,
    },
    json: true,
  }).then(response => {
    if (response.errorCode > 0) {
      const err = new Error(response.errorDetails);
      err.response = response;
      throw err;
    }

    return response;
  });
}

function synchronizeScreenSets(env) {
  return Promise.all(Object.keys(env.screenSets).map(screenSetId => setScreenSet(screenSetId, env)));
}

module.exports = async env => {
  await synchronizeScreenSets(env);
};
