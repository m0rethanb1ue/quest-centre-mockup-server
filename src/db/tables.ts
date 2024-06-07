import { createDb } from '../utils.js'

export const Operators = await createDb('operators')
export const Sponsors = await createDb('sponsors')
export const Participant = await createDb('participants')

export const Campaign = await createDb('campaign')
export const Action = await createDb('action')
export const QuestTypes = await createDb('quest-types')
export const QuestInfo = await createDb('quest-info')

export const Reward = await createDb('reward')
export const RewardDistribution = await createDb('reward-distribution')
