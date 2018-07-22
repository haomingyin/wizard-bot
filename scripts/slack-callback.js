// Description:
//   Web hook for Slack interactive callback actions
//
// Configuration:
//   SLACK_VERIFICATION_TOKEN
//
// Author:
//   Haoming Yin

const { createMessageAdapter } = require("@slack/interactive-messages");
const bodyParser = require("body-parser");
const jenkins = require("./jenkins/jenkins-helper");
const rr = require("./common/random-reply");

module.exports = robot => {
  // get express app
  const app = robot.router;

  // Create the adapter using the app's verification token, read from environment variable
  const slackInteractions = createMessageAdapter(
    process.env.SLACK_VERIFICATION_TOKEN
  );

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use("/slack/actions", slackInteractions.expressMiddleware());

  const selectItems = ["I prefer", "Go with", "Let's take", "I choose", "How about"];

  slackInteractions.action(/.*/, (payload, respond) => {

    const reply = payload.original_message;
    delete reply.attachments[0].actions;
    reply.attachments[0].text += `\n[${new Date().toLocaleTimeString()}] ` +
      `<@${payload.user.id}>: ${rr.random(selectItems)} \`${payload.actions[0].value}\`.`

    jenkins.submitInput(
      JSON.parse(robot.brain.get(payload.callback_id)),
      payload.actions[0].value
    )
    .then(_ => {
      reply.attachments[0].color = "#1aa343";
      reply.attachments[0].text += `\n[${new Date().toLocaleTimeString()}] *Jenkins*: ${rr.confirm()}!`
      respond(reply);
    })
    .catch(error => {
      reply.attachments[0].color = "#d63939";
      reply.attachments[0].text += `\n[${new Date().toLocaleTimeString()}] *Jenkins*: Something went wrong, sorry that I failed you :(`
      robot.logger.error(error);
      respond(reply);
    });

    return reply;
  });

};

// module.exports.getInteractiveMessage = (pendingInput)
