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

module.exports = (robot) ->

  robot.respond /build (.+)/i, (res) ->
    jenkins_build res, [res.match[1]]

  robot.router.post '/hubot/jenkins/echo/:project', (req, res) ->
    room = '#general'
    project = req.params.project
    robot.messageRoom room, "I have heard that someone wants to build for project '#{project}'"
    res.send req.body

  ###
  build command helper to trigger a new build on Jenkins server
  @param {object} bot response
  @param {array} [project_name]
  @return {bool} true if a new build is triggered
  ###
  jenkins_build = (res, args) ->
    url = "#{get_project_url args[0]}/build"
    robot.http(url)
      .auth(get_auth()...)
      .post() (err, resp, body) ->
        if err or resp.statusCode isnt 201
          robot.logger.error "Failed to trigger a build at '#{url}', status code: '#{resp.statusCode}', error: #{err}"
          res.send "Oops, Jenkins didn't want to build for project '#{args[0]}''"
        else
          res.send "Bee bu, a new build has been triggered for project '#{args[0]}''"
        return resp.statusCode is 201

  get_auth = () ->
    username = process.env.JENKINS_USERNAME
    apiKey = process.env.JENKINS_API_KEY
    return [username, apiKey]

  ###
  get the Jenkins server url with given project and branch name
  @param {string} project name
  @param {string} branch name
  @return {string} the url
  ###
  get_project_url = (project, branch="master") ->
    host = process.env.JENKINS_HOST
    org = process.env.JENKINS_ORG
    return "#{host}/job/#{org}/job/#{project}/job/#{branch}"
