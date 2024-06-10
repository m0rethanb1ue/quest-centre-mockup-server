/* eslint-disable @typescript-eslint/ban-ts-comment */
import _ from 'lodash'
import {
  Action,
  Campaign,
  Participant,
  QuestTypes,
  Sponsors,
} from './tables.js'

export const getParticipant = (user_address: string) => {
  const user = Object.values(Participant.data).find(
    ({ address }) => address.toLowerCase() === user_address.toLowerCase(),
  )
  return user
}

export const getParticipantId = (user_address: string) => {
  return _.get(getParticipant(user_address), 'id', '')
}

export const getCampaign = (campaign_id: string) => {
  return _.get(Campaign.data, campaign_id)
}

export const getSponsor = (sponsor_id: string) => {
  return Object.values(Sponsors.data).find(
    // @ts-expect-error
    e => e.extra_info.quest_id === sponsor_id,
  )
}

export const getPreconditionActionIds = (quest_type_id: string) => {
  return _.get(QuestTypes.data, `${quest_type_id}.pre_condition_action_ids`, [])
}

export const getActivities = (quest_type_id: string) => {
  return getPreconditionActionIds(quest_type_id).reduce(
    (accumulator, actionId) => accumulator.concat(Action.data[actionId]),
    [],
  )
}
