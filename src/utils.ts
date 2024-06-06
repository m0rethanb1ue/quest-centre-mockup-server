import { JSONFilePreset } from 'lowdb/node'
import { v4 } from 'uuid'
import {
  uniqueNamesGenerator,
  names,
  adjectives,
  starWars,
} from 'unique-names-generator'

export const uuidv4 = () => v4()

const fileResolver = (fileName: string) =>
  ['./src/db/json', `${fileName}.json`].join('/')

export const createDb = async <T = Record<string, unknown>>(
  fileName: string,
  initialDb?: T,
) => {
  return await JSONFilePreset<T>(fileResolver(fileName), initialDb ?? ({} as T))
}

export const makeLoremIpsum = (repeat = 1) =>
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'.repeat(
    Math.floor(Math.random() * repeat) + 1,
  )

export const randomInt = (min = 1, max = 3) =>
  Math.floor(Math.random() * (max - 1 + min) + 1)

export const randomIndex = (length: number) => randomInt(0, length - 1)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initTimestamp = (_state?: unknown) => Date.now()

export const makeName = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, names],
    separator: ' ',
    style: 'capital',
  })

export const makeOrganzierName = () =>
  uniqueNamesGenerator({
    dictionaries: [starWars],
    separator: '_',
    style: 'lowerCase',
  })
    .split(' ')
    .join('_')
