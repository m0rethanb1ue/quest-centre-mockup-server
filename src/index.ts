/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import chalk from 'chalk'
import express from 'express'
import { Action, QuestInfo, QuestTypes } from './db/tables.js'
import bodyParser from 'body-parser'
import _ from 'lodash'

const PORT = 3001

const server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

server.get('/ping', (_, response) => response.send('pong!'))

server.get('/quests', async (request, response) => {
  const limit = _.get(request.query, 'limit', 5)
  response.send(Object.values(QuestInfo.data).slice(0, limit))
})

server.get('/quest-activities', async (request, response) => {
  const type_id = _.get(request.query, 'quest_type_id', '')

  const activities = _.get(
    QuestTypes.data,
    `${type_id}.pre_condition_action_ids`,
    [],
  ).reduce(
    (accumulator, actionId) => accumulator.concat(Action.data[actionId]),
    [],
  )

  response.send(activities)
})

server.listen(PORT, () => console.log(chalk.cyan(`[${PORT}] Server Ready!`)))
