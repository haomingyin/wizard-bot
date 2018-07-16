// dialogflow = require('dialogflow')

// projectId = process.env.DIALOGFLOW_PROJECT_ID
// sessionId = 'hubot-test-session'
// languageCode = 'en'

// # // Instantiate a DialogFlow client
// sessionClient = new dialogflow.sessionClient()
// session = sessionClient.sessionPath projectId, sessionId


// module.exports = (robot) ->

//   robot.respond /ai .*/i, (res) ->

//     req = {
//       session,
//       queryInput: {
//         text: {
//           text: res.match[1],
//           languageCode
//         }
//       }
//     }

//     sessionClient
//     .detectIntent(req)
//     .then (responses) ->
//       r = responses[0].queryResult
//       res.send "
//       intent: '#{r.intent.displayName}'
//       paramter: '#{r.parameters}'
//       intentDetectionConfidence: '#{r.intentDetectionConfidence}'
//       "

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionId = 'hubot-test-session';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

module.exports = (robot) => {

  robot.catchAll((res) => {
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: res.message.text,
          languageCode: languageCode,
        },
      },
    };

    // Send request and log result
    sessionClient
    .detectIntent(request)
    .then(responses => {
      var r = responses[0].queryResult;
      res.send(`intent: '${r.intent.displayName}' paramter: '${JSON.stringify(r.parameters)}' intentDetectionConfidence: '${r.intentDetectionConfidence}'`)
    });
  });
}
