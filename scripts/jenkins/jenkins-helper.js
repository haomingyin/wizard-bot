const axios = require("axios");
const uuid = require("uuid/v1");
const qs = require("querystring");
const rr = require("../common/random-reply");

module.exports.build = repo => {
  const url = `${getJobUrl(repo)}/build`;
  return axios.post(url, {}, getAxiosConfig());
};

/**
 * Delegation for Jenkins step notification. It can process Jenkins' input and
 * message request
 */
module.exports.hubotJenkinsDelegate = (robot, req, res) => {
  res.send("Ok");
  if (req.body.stepName == "APPROVE") {
    buildUrl = req.body.envVars.BUILD_URL;
    inputId = req.body.id;

    // wait 1 sec to let Jenkins go to next step
    setTimeout(() => {
      getPendingInput(buildUrl, inputId)
        .then(pendingInputs => {
          message = getSlackButtonMessage(pendingInputs, req);
          paramName = pendingInputs.inputs[0].name;

          robot.brain.set(
            message.attachments[0].callback_id,
            JSON.stringify({
              buildUrl,
              inputId,
              paramName
            })
          );
          robot.messageRoom(req.params.room, message);
        })
        .catch(error => {
          robot.logger.error(error);
        });
    }, 1000);
  } else if (req.body.stepName == "SEND") {
    buildUrl = req.body.envVars.BUILD_URL;
    robot.messageRoom(req.params.room, getSlackPlainMessage(req));
  }
};

/**
 * only accept one input for one inputId
 * doesn't support one inputId associated with multiple input entries
 * meta: {buildUrl, inputId, paramName}
 */
module.exports.submitInput = (meta, value) => {
  return axios.post(
    `${meta.buildUrl}/wfapi/inputSubmit?inputId=${meta.inputId}`,
    qs.stringify({
      json: JSON.stringify({
        proceed: "yes",
        parameter: [
          {
            name: meta.paramName,
            value: value
          }
        ]
      })
    }),
    getAxiosConfig()
  );
};

/**
 * Query Jenkins server for pending input with the given input id
 */
var getPendingInput = (buildUrl, inputId) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${buildUrl}/wfapi/pendingInputActions`, getAxiosConfig())
      .then(response => {
        response.data.forEach(input => {
          // Jenkins might auto capitalize inputID
          if (input.id.toLowerCase() == inputId.toLowerCase()) {
            resolve(input);
          }
        });
        reject({
          error: "No pending input",
          buildUrl
        });
      })
      .catch(error => {
        reject({
          error: "Failed to fetch pending input",
          status: error.response.status,
          buildUrl
        });
      });
  });
};

/*
 * get the Jenkins server url with given project and branch name
 */
var getJobUrl = (repo, branch = "master") => {
  host = process.env.JENKINS_HOST;
  org = process.env.JENKINS_ORG;
  return `${host}/job/${org}/job/${repo}/job/${branch}`;
};

var getAxiosConfig = () => {
  username = process.env.JENKINS_USERNAME;
  password = process.env.JENKINS_API_KEY;
  return {
    auth: { username, password }
  };
};

/**
 * Convert Jenkins step message to slack vanilla message
 * @param req Request received from Jenkins
 */
var getSlackPlainMessage = req => {
  env = req.body.envVars;

  return {
    text: `${rr.title()}, _Jenkins_ has a message to you ...`,
    attachments: [
      {
        text: `*Job*: <${env.JOB_URL}|${env.JOB_NAME}>\n` +
        `*Build*: <${env.BUILD_URL}|#${env.BUILD_NUMBER}>\n` +
        `*Message*: ${req.body.message}\n`,
        fallback: "Error: you are unable to view the message.",
        color: "#148ace",
        attachment_type: "default"
      }
    ]
  };
};

/**
 * Convert Jenkins step input approve message to slack message with attachments
 * @param pendingInputs pending inputs response body
 * @param req Request received from Jenkins
 */
var getSlackButtonMessage = (pendingInputs, req) => {
  inp = pendingInputs.inputs[0]; // only process the first input entry
  env = req.body.envVars;
  ts = new Date().toLocaleTimeString();

  if (inp.type == "ChoiceParameterDefinition") {
    actions = inp.definition.choices.map(value => {
      return {
        name: "choice",
        text: value,
        type: "button",
        value
      };
    });

    return {
      text: `${rr.title()}, please instruct _Jenkins_ to proceed ...`,
      attachments: [
        {
          text: `*Job*: <${env.JOB_URL}|${env.JOB_NAME}>` +
          `\n*Build*: <${env.BUILD_URL}|#${env.BUILD_NUMBER}>` +
          `\n[${ts}] *Jenkins*: ${req.body.message} ${inp.description}`,
          fallback: "Error: you are unable to make choice.",
          callback_id: uuid(),
          color: "#148ace",
          attachment_type: "default",
          actions
        }
      ]
    };
  }
};
