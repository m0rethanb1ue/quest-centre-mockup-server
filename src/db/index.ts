import {
  OperatorAddresses,
  SponsorAddresses,
  UserAddresses,
} from '../addresses.js'
import {
  ACTION_TYPE,
  FREQUENCY,
  PERMISSION,
  SECTION_TYPE,
  STATUS,
} from '../constants.js'
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
  ParticipantAction,
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

const initTable = async () => {
  await Promise.all([ParticipantAction.write()])
}

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
      SponsorAddresses.reduce(accumulator => {
        const sponsorId = uuidv4()
        return {
          ...accumulator,
          [sponsorId]: {
            id: sponsorId,
            name: makeName(),
            description: makeLoremIpsum(1),
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
            ][randomInt(0, 2)],
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
      id: campaign_id,
      approved_by: operatorIds[randomIndex(operatorIds.length)],
      creator: operatorIds[randomIndex(operatorIds.length)],
      sponsor: sponsorIds[randomIndex(sponsorIds.length)],
      description: ['Master Chief', makeLoremIpsum(1).toLowerCase()].join(' '),
      start_time: initTimestamp(),
      end_time: initTimestamp(),
      status: STATUS.InternalPublish,
      organizer: makeOrganzierName(),
    }),
  )

  const actions = {}
  const questInfo = {}
  const questType = {}

  for await (const {
    id: quest_info_id,
    name: questName,
    ingredients,
    instructions,
    ...rest
  } of recipes) {
    const _actions = {
      ...instructions.reduce((accumulator, content) => {
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
      }, {}),
      ...ingredients.reduce((accumulator, content) => {
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
      }, {}),
    }

    const quest_type_id = uuidv4()

    const nextQuestInfo = {
      id: quest_info_id,
      name: questName,
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
      name: questName,
      description: questName,
      frequency: FREQUENCY.Daily,
      pre_condition_action_ids: Object.keys(_actions),
      pre_condition_quests_ids: [],
      created_at: initTimestamp(),
      updated_at: initTimestamp(),
    }

    Object.assign(actions, _actions)
    Object.assign(questInfo, { ...questInfo, [quest_info_id]: nextQuestInfo })
    Object.assign(questType, { ...questType, [quest_type_id]: nextQuestType })
  }

  await Action.update(data => Object.assign(data, actions))
  await QuestInfo.update(data => Object.assign(data, questInfo))
  await QuestTypes.update(data => Object.assign(data, questType))
}

dump()
