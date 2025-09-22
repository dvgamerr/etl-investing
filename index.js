import puppeteer from 'puppeteer'

import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'

import { logger, sleep } from './untils'

// import { name, version } from './package.json'

dayjs.extend(weekday)
dayjs.extend(weekOfYear)
logger.info('Puppeteer create launcher...')
// const db = new duckdb.Database(':memory:')
const isDev = true
const browser = await puppeteer.launch({
  headless: !isDev,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  },
  timeout: 60000,
  args: isDev ? ['--fast-start', '--no-sandbox'] : ['--no-sandbox', '--disable-gpu', '--headless', '--no-experiments'],
})

const delay = 1000
async function scrollToBottom(page) {
  await page.evaluate(() => {
    window.scrollTo(0, window.document.body.scrollHeight - 240)
  })
  await sleep(delay)
  await page.waitForNetworkIdle()
}

const getDividends = async (page, investing) => {
  try {
    // Major Cineplex
    logger.info(`Watching ${investing}`)
    await page.goto(investing)
    await page.waitForNetworkIdle()
    await scrollToBottom(page)
    const items = await page.$$eval('.infinite-scroll-component table > tbody > tr', (rows) => {
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll('td')
        return Array.from(columns, (column) => column.innerText)
      })
    })
    // [ "Apr 03, 2008", "7.50", "F", "Apr 23, 2008", "6.88%" ]
    return items.map((e) => {
      return {
        date: dayjs(e[0], 'MMM DD, YYYY').format('YYYY-MM-DD'),
        dividend: parseFloat(e[1]),
        type: e[2],
        payment: dayjs(e[3], 'MMM DD, YYYY').format('YYYY-MM-DD'),
        yield: parseFloat(e[4].replace('%', '')),
      }
    })
  } catch (ex) {
    logger.warn(ex)
  } finally {
    await page.close()
  }
}

const scc = await getDividends(await browser.newPage(), 'https://th.investing.com/equities/siam-cement-dividends')

console.log(scc)

logger.info(`Closed.`)
await browser.close()
