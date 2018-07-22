# Description:
#   Commands that related to Jenkins
#
# Configuration:
#   JENKINS_HOST
#   JENKINS_ORG
#   JENKINS_USERNAME
#   JENKINS_API_KEY
#
# Commands:
#   hubot build <project_name> - start a new build for the project on Jenkins
#
# Author:
#   Haoming Yin

jenkins = require('./jenkins/jenkins-helper.js')

module.exports = (robot) ->

  robot.respond /build (.+)/i, (res) ->
    jenkins_build res, [res.match[1]]

  robot.on 'build', (res, args) ->
    jenkins_build res, args

  ###
  listener for Jenkins Hubot Steps plugin
  ###
  robot.router.post '/hubot/notify/:room', (req, res) ->
    jenkins.hubotJenkinsDelegate robot, req, res

    # room = '#general'
    # body = JSON.stringify req.body
    # robot.messageRoom room, "requset body: #{body}"
    # res.send "Ok"

  ###
  build command helper to trigger a new build on Jenkins server
  @param {object} bot response
  @param {array} [project_name]
  @return {bool} true if a new build is triggered
  ###
  jenkins_build = (res, args) ->
    jenkins.build(args[0])
    .then (resp) ->
      res.send "Bee bu, a new build has been triggered for project '#{args[0]}'"
    .catch (err) ->
      robot.logger.error "Failed to build for '#{args[0]}' / Err: '#{err.response.status}"
      res.send "Oops, Jenkins didn't want to build for project '#{args[0]}'"
