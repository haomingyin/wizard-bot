pipeline {
  agent {
    label 'master'
  }
  environment {
    HUBOT_DEFAULT_ROOM = 'jenkins'
    APP_NAME = 'wizard-bot'
    JENKINS_ORG = 'Haoming Yin'
  }
  stages {
    stage ('Promotion') {
      steps {
        script {
          def promotion = 'No'
          timeout (time: 30, unit: 'MINUTES') {
            promotion = hubotApprove message: "Do you wish to deploy this build to production environment?", ok: "Confirm", id: "PromotionInput",
            parameters: [choice(name: 'promotion', choices: 'Yes\nNo', description: '')]
          }

          if (promotion == 'No') {
            currentBuild.result = 'ABORTED'
            echo 'Build has been stopped to promote to production environment.'
          } else {
            echo 'Build will be promoted to production environment.'
          }
        }
      }
    }

    stage ('Credentials Injection') {
      steps {
        script {
          sh "mkdir -p ./credentials"
          withCredentials([file(credentialsId: 'WB_GOOLE_DIALOGFLOW_KEY', variable: 'WB_GOOLE_DIALOGFLOW_KEY')]) {
            sh "cp ${WB_GOOLE_DIALOGFLOW_KEY} ./credentials/google-dialogflow-key.json"
          }
        }
      }
    }

    stage ('Docker - build') {
      steps {
        sh "docker build -t ${env.APP_NAME}:latest ."
      }
    }

    stage ('Docker - run') {
      steps {
        script {
          try {
            sh "docker kill wizard-bot-prod"
          } catch (err) {
            echo "Wizard bot is not running, skip..."
          }

          withCredentials([string(credentialsId: 'JENKINS_USERNAME', variable: 'JENKINS_USERNAME'),
          string(credentialsId: 'JENKINS_API_KEY', variable: 'JENKINS_API_KEY'),
          string(credentialsId: 'WB_DIALOGFLOW_PROJECT_ID', variable: 'WB_DIALOGFLOW_PROJECT_ID'),
          string(credentialsId: 'WB_SLACK_BOT_USER_TOKEN', variable: 'WB_SLACK_BOT_USER_TOKEN'),
          string(credentialsId: 'WB_SLACK_VERIFICATION_TOKEN', variable: 'WB_SLACK_VERIFICATION_TOKEN')]) {
            sh """\
              docker run -d --rm -p 8089:8089 --network="host" --name wizard-bot-prod \
              --env-file ./.env \
              -e JENKINS_URL="${env.JENKINS_URL}" \
              -e JENKINS_ORG="${env.JENKINS_ORG}" \
              -e JENKINS_USERNAME="${JENKINS_USERNAME}" \
              -e JENKINS_API_KEY="${JENKINS_API_KEY}" \
              -e DIALOGFLOW_PROJECT_ID="${WB_DIALOGFLOW_PROJECT_ID}" \
              -e HUBOT_SLACK_TOKEN="${WB_SLACK_BOT_USER_TOKEN}" \
              -e SLACK_VERIFICATION_TOKEN="${WB_SLACK_VERIFICATION_TOKEN}" \
              ${env.APP_NAME} \
              """
            }
        }
      }
    }
  }
  post {
    success {
      script {
        echo "Sleep 30s to prepare the refreshed Wizard to receive message ..."
        sleep 30
        hubotSend message: "Build finished successfully!"
      }
    }
    failure {
      script {
        hubotSend message: "Build has failed."
      }
    }
    aborted {
      script {
        hubotSend message: "Build has been aborted."
      }
    }
    always {
        cleanWs()
    }
  }
}
