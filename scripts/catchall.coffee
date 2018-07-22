# Description:
#   Catch all commands that have been matched, and run them through Dialogflow
#
# Configuration:
#   DIALOGFLOW_PROJECT_ID
#   GOOGLE_APPLICATION_CREDENTIALS
#
# Note:
#   Only directly addressed message will be run through NLP
#
# Author:
#   Haoming Yin

df = require "./common/dialogflow.js"

module.exports = (robot) ->

  robot.catchAll (res) ->

    # match if message was directly addressed to bot
    query = res.message.text
    r = new RegExp "^(?:#{robot.alias}|@?#{robot.name}) (.*)", "i"
    if query # query might be empty
      matches = query.match r

    if matches and matches.length > 1
      query = matches[1]

      # process query via dialogflow NLP
      df.detectIntent query, (r, intent, params) ->

        # log dialogflow detection result
        robot.logger.info "query: '#{query}'; intent: '#{intent}'; paramter: '#{JSON.stringify params}'"

        robot.emit "#{intent}", res, [params.service_name.stringValue]
        # res.message.text = "#{intent} #{params.service_name.stringValue}"

    res.finish()
