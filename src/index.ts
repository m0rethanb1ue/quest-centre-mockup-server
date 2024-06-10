/* eslint-disable @typescript-eslint/ban-ts-comment */
import chalk from 'chalk'
import express from 'express'
import { QuestInfo, Reward } from './db/tables.js'
import bodyParser from 'body-parser'
import _ from 'lodash'
import { getActivities, getParticipantId, getSponsor } from './db/controller.js'
import morgan from 'morgan'
import { JSONFilePreset } from 'lowdb/node'
import { initTimestamp, uuidv4 } from './utils.js'

export const ParticipantAction = await JSONFilePreset(
  'participant-action.json',
  {},
)
await ParticipantAction.write()

export const getParticipantAction = (user_address: string) => {
  const participant_id = getParticipantId(user_address)
  const current_participant_action = _.get(
    ParticipantAction.data,
    participant_id,
    {},
  )

  return Object.values(current_participant_action)
}

export const createParticipantAction = async (
  user_address: string,
  action_id: string,
) => {
  try {
    const participant_id = getParticipantId(user_address)
    const participant_action_id = uuidv4()
    const created_action = {
      id: participant_action_id,
      participant_id: participant_id,
      action_id: action_id,
      created_at: initTimestamp(),
      updated_at: initTimestamp(),
    }

    return created_action
  } catch (error) {
    return null
  }
}

const PORT = 3001

const server = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))
server.use(morgan('dev'))

server.get('/ping', (_, response) => response.send('pong!'))

server.get('/quests', async (request, response) => {
  const limit = _.get(request.query, 'limit', 5)
  response.send(Object.values(QuestInfo.data).slice(0, limit))
})

server.get('/quests/:id', async (request, response) => {
  const quest_id = _.get(request.params, 'id', '')
  const quest = _.get(QuestInfo.data, quest_id)
  if(!quest) {
    response.status(404)
    response.send({ error: 'not found' })
    return
  }
  response.send(quest)
})

server.get('/quest-activities', async (request, response) => {
  const quest_type_id = _.get(request.query, 'quest_type_id', '')
  response.send(getActivities(quest_type_id))
})

server.get('/sponsor-info', async (request, response) => {
  const campaign_id = _.get(request.query, 'campaign_id', '')
  const sponsor = getSponsor(campaign_id)
  response.send(sponsor)
})

server.get('/reward', async (request, response) => {
  const quest_id = _.get(request.query, 'quest_id', '')
  const reward = Object.values(Reward.data).filter(
    // @ts-expect-error
    reward => reward.quest_id === quest_id,
  )
  response.send(reward)
})

server.post('/take-activity', async (request, response) => {
  try {
    const participant_id = getParticipantId(
      _.get(request.body, 'user_address', ''),
    )

    const action_id = _.get(request.body, 'action_id', '')
    const quest_type_id = _.get(request.body, 'quest_type_id', '')

    if (!_.get(ParticipantAction.data, participant_id)) {
      await ParticipantAction.update(data =>
        Object.assign(data, { [participant_id]: {} }),
      )
    }

    const participant_actions = _.get(ParticipantAction.data, participant_id)
    const next_id = [quest_type_id, action_id].join('#')

    if (_.get(participant_actions, next_id)) {
      response.send(true)
      return
    }

    const next_action = {
      id: next_id,
      participant_id,
      action_id,
      created_at: initTimestamp(),
      updated_at: initTimestamp(),
    }

    participant_actions[next_id] = next_action
    await ParticipantAction.update(data =>
      Object.assign(data, { [participant_id]: participant_actions }),
    )
    response.send(true)
  } catch (error) {
    console.error(error)
    response.send(false)
  }
})

server.post('/verify-precondition', async (request, response) => {
  const user_address = _.get(request.body, 'user_address', '')
  const action_ids: string[] = _.get(request.body, 'action_ids', [])
  const quest_id = _.get(request.body, 'quest_type_id', [])

  const participant_action = getParticipantAction(user_address)
    // @ts-expect-error
    .filter(p_action => p_action.id.split('#')[0] === quest_id)
    // @ts-expect-error
    .map(p_action => p_action.id)

  const result = Array(action_ids.length).fill(false)

  for (let index = 0; index < action_ids.length; index++) {
    result[index] = participant_action[index] === action_ids[index]
  }

  response.send(result)
})

server.listen(PORT, () => console.log(chalk.cyan(`[${PORT}] Server Ready!`)))
