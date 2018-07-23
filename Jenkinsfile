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
        sh "docker build -t ${env.APP_NAME}:${env.BUILD_NUMBER} -t ${env.APP_NAME}:latest ."
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
              docker run -d -rm -p 8089:8089 --name wizard-bot-prod \
              --env-file ./.env \
              -e JENKINS_URL=${env.JENKINS_URL} \
              -e JENKINS_ORG=${env.JENKINS_ORG} \
              -e JENKINS_USERNAME=${JENKINS_USERNAME} \
              -e JENKINS_API_KEY=${JENKINS_API_KEY} \
              -e DIALOGFLOW_PROJECT_ID=${WB_DIALOGFLOW_PROJECT_ID} \
              -e HUBOT_SLACK_TOKEN=${WB_SLACK_BOT_USER_TOKEN} \
              -e SLACK_VERIFICATION_TOKEN=${WB_SLACK_VERIFICATION_TOKEN} \
              ${env.APP_NAME}:latest \
              """
            }
        }
      }
    }
  }
  post {
    always {
        cleanWs()
    }
  }
}
