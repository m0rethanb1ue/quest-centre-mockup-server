import { createDb } from '../utils.js'

export const Operators = await createDb('operators')
export const Sponsors = await createDb('sponsors')
export const Participant = await createDb('participants')
export const ParticipantAction = await createDb('participant-action')

export const Campaign = await createDb('campaign')
export const Action = await createDb('action')
export const RewardDistribution = await createDb('reward-distribution')
export const QuestTypes = await createDb('quest-types')
export const QuestInfo = await createDb('quest-info')
