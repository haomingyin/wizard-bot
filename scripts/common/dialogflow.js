const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = 'hubot-test-session';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

module.exports.detectIntent = (query, cb) => {

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  sessionClient
  .detectIntent(request)
  .then(res => {
    var r = res[0].queryResult;
    cb(res, r.intent.displayName, r.parameters.fields);
  });
}

module.exports.sayHi = (query) => {
  console.log("Hi! " + query);
}
