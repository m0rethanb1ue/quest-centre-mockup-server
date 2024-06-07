/* eslint-disable @typescript-eslint/ban-ts-comment */
import _ from 'lodash'
import { OperatorAddresses, UserAddresses } from '../addresses.js'
import { Tokens } from '../constants.js'
import {
  ACTION_TYPE,
  DISTRIBUTION_TYPE,
  FREQUENCY,
  PERMISSION,
  REWARD_TYPE,
  SECTION_TYPE,
  STATUS,
} from '../types.js'
import {
  initTimestamp,
  makeLoremIpsum,
  makeName,
  makeOrganzierName,
  randomIndex,
  randomInt,
  uuidv4,
} from '../utils.js'
import {
  Operators,
  Sponsors,
  Participant,
  Campaign,
  QuestTypes,
  Action,
  QuestInfo,
  Reward,
} from './tables.js'

const getDummyJSON = async (): Promise<Record<string, unknown>> => {
  try {
    const response = await fetch('https://dummyjson.com/recipes?limit=50')
    return (await response.json()) as Record<string, unknown>
  } catch (error) {
    console.error(error)
    return {}
  }
}

const initTable = async () => {}

const dump = async () => {
  // * get dummy data
  const dummy = await getDummyJSON()
  const recipes = Object.values(dummy.recipes).map(recipe => ({
    ...recipe,
    id: uuidv4(),
  }))
  if (!recipes.length) {
    return
  }

  // * init tables
  initTable()

  await Sponsors.update(data =>
    Object.assign(
      data,
      recipes.reduce((accumulator, recipe) => {
        const sponsorId = uuidv4()
        return {
          ...accumulator,
          [sponsorId]: {
            id: sponsorId,
            name: recipe.cuisine,
            description: makeLoremIpsum(1),
            logo_url: [
              'https://em-content.zobj.net/source/apple/391/pinched-fingers_light-skin-tone_1f90c-1f3fb_1f3fb.png',
              'https://em-content.zobj.net/source/apple/391/clown-face_1f921.png',
              'https://em-content.zobj.net/source/apple/391/heart-hands_light-skin-tone_1faf6-1f3fb_1f3fb.png',
            ][randomIndex(3)],
            extra_info: { quest_id: recipe.id },
          },
        }
      }, {}),
    ),
  )
  await Operators.update(data =>
    Object.assign(
      data,
      OperatorAddresses.reduce((accumulator: object, address) => {
        const id = uuidv4()
        return {
          ...accumulator,
          [id]: {
            id,
            address,
            name: makeName(),
            permission: [
              PERMISSION.Admin,
              PERMISSION.Creator,
              PERMISSION.MasterAdmin,
              PERMISSION.Viewer,
            ][randomIndex(4)],
          },
        }
      }, {}),
    ),
  )
  await Participant.update(data =>
    Object.assign(
      data,
      UserAddresses.reduce((accumulator, address) => {
        const participant_id = uuidv4()
        return {
          ...accumulator,
          [participant_id]: {
            id: participant_id,
            address,
            name: makeName(),
            extra_info: {},
          },
        }
      }, {}),
    ),
  )

  const sponsorIds = Object.keys(Sponsors.data)
  const operatorIds = Object.keys(Operators.data)

  const campaign_id = uuidv4()

  await Campaign.update(data =>
    Object.assign(data, {
      [campaign_id]: {
        id: campaign_id,
        approved_by: operatorIds[randomIndex(operatorIds.length)],
        creator: operatorIds[randomIndex(operatorIds.length)],
        sponsor: sponsorIds[randomIndex(sponsorIds.length)],
        description: ['Master Chief', makeLoremIpsum(1).toLowerCase()].join(
          ' ',
        ),
        start_time: initTimestamp(),
        end_time: initTimestamp(),
        status: STATUS.InternalPublish,
        organizer: makeOrganzierName(),
      },
    }),
  )

  const actions = {}
  const questInfo = {}
  const questType = {}
  const reward = {}

  for await (const {
    id: quest_id,
    name,
    ingredients,
    instructions,
    ...rest
  } of recipes) {
    const pre_conditions = ingredients
      .slice(0, randomInt(1, 5))
      .reduce((accumulator, content) => {
        const id = uuidv4()
        return {
          ...accumulator,
          [id]: {
            id,
            name: content,
            description: content,
            action_type: ACTION_TYPE.BuyItem,
            section_type: SECTION_TYPE.Condition,
            freqency: FREQUENCY.Daily,
            start_date: initTimestamp(),
            end_date: initTimestamp(),
            created_at: initTimestamp(),
            updated_at: initTimestamp(),
          },
        }
      }, {})

    const quest_actions = instructions.reduce((accumulator, content) => {
      const id = uuidv4()
      return {
        ...accumulator,
        [id]: {
          id,
          name: content,
          description: content,
          action_type: ACTION_TYPE.CheckIn,
          section_type: SECTION_TYPE.Action,
          freqency: FREQUENCY.Daily,
          start_date: initTimestamp(),
          end_date: initTimestamp(),
          created_at: initTimestamp(),
          updated_at: initTimestamp(),
        },
      }
    }, {})

    const _actions = { ...pre_conditions, ...quest_actions }

    const quest_type_id = uuidv4()

    const nextQuestInfo = {
      id: quest_id,
      name: name,
      quest_type_id,
      campaign_id,
      description: makeLoremIpsum(1),
      status: STATUS.InternalPublish,
      extra_info: {},
      reject_reason: '',
      hashtag: rest.tags,
      logo_url: rest.image,
      background_url: rest.image,
      eligible_join_time: initTimestamp(),
      created_at: initTimestamp(),
      updated_at: initTimestamp(),
    }

    const nextQuestType = {
      id: quest_type_id,
      name: name,
      description: name,
      frequency: FREQUENCY.Daily,
      pre_condition_action_ids: Object.keys(_actions),
      pre_condition_quests_ids: [],
      created_at: initTimestamp(),
      updated_at: initTimestamp(),
    }

    const registeredIndex = []
    const bunchOfReward = Array.from({ length: randomInt(5) }).reduce(
      (accumulator: object) => {
        const tokenIndex = randomIndex(Tokens.length)
        if (registeredIndex.includes(tokenIndex)) {
          return accumulator
        }

        registeredIndex.push(tokenIndex)
        const picked_token = Tokens[tokenIndex]

        const reward_id = uuidv4()

        return {
          ...accumulator,
          [reward_id]: {
            id: reward_id,
            quest_id: quest_id,
            name: picked_token.name,
            description: makeLoremIpsum(1),
            type: REWARD_TYPE.OnChainToken,
            value: _.random(0.1, 3.5),
            token_address: picked_token.contract,
            extra_info: { logo: picked_token.logo },
            reward_distribution_id: null,
            distribution_type: DISTRIBUTION_TYPE.Instant,
            distribution_time: initTimestamp(),
            created_at: initTimestamp(),
            updated_at: initTimestamp(),
          },
        }
      },
      {},
    )

    Object.assign(actions, _actions)
    Object.assign(reward, bunchOfReward)
    Object.assign(questInfo, { ...questInfo, [quest_id]: nextQuestInfo })
    Object.assign(questType, { ...questType, [quest_type_id]: nextQuestType })
  }

  await Action.update(data => Object.assign(data, actions))
  await Reward.update(data => Object.assign(data, reward))
  await QuestInfo.update(data => Object.assign(data, questInfo))
  await QuestTypes.update(data => Object.assign(data, questType))
}

dump()
