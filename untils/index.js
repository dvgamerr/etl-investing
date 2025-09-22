import util from 'util'
import pino from 'pino'

export const logger = pino({ level: Bun.env.LOG_LEVEL || 'info' })

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

const { values: argv } = util.parseArgs({
  args: Bun.argv,
  options: {
    output: { short: 'o', type: 'string' },
    dryrun: { short: 'd', type: 'boolean' },
  },
  strict: true,
  allowPositionals: true,
})

export const parseArgs = argv
