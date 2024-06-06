import _ from 'lodash'
import { Participant } from './tables.js'

export const getUser = (user_address: string) => {
  const user = Object.values(Participant.data).find(
    ({ address }) => address.toLowerCase() === user_address.toLowerCase(),
  )
  return user
}

export const getUserId = (user_address: string) => {
  return _.get(getUser(user_address), 'id')
}
