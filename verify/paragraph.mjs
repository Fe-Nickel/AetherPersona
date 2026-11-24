import puppeteer from 'puppeteer-core'

const edge =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const browser = await puppeteer.launch({
  executablePath: edge,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1500, height: 1200, deviceScaleFactor: 1 })

  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })

  await page.goto('http://localhost:5173/', {
    waitUntil: 'networkidle0',
    timeout: 30000,
  })
  await sleep(1200)

  const primary = '.step__actions .btn--primary'
  await page.click(primary)
  await sleep(400)
  await page.click(primary)
  await sleep(400)

  await page.evaluate(() => {
    document.querySelectorAll('.question').forEach((question) => {
      const option = question.querySelector('.option')
      if (option) option.click()
    })
  })
  await sleep(700)

  await page.click(primary)
  await sleep(600)

  const tiles = await page.$$('.deck .tile')
  for (let i = 0; i < 3; i += 1) {
    await tiles[i].click()
    await sleep(200)
  }
  await sleep(300)

  await page.click(primary)
  await sleep(1300)

  const title = await page.$eval('.card__title', (el) => el.textContent)
  const story = await page.$eval('.card__story', (el) => el.textContent)
  const weakness = await page.$eval('.card__weak', (el) => el.textContent)
  const box = await page.evaluate(() => {
    const card = document.querySelector('.card').getBoundingClientRect()
    const lore = document.querySelector('.card__lore').getBoundingClientRect()
    const foot = document.querySelector('.card__foot').getBoundingClientRect()
    return {
      cardBottom: Math.round(card.bottom),
      loreBottom: Math.round(lore.bottom),
      footBottom: Math.round(foot.bottom),
    }
  })

  console.log(JSON.stringify({ title, story, weakness, box, errors }))
  await page.screenshot({ path: 'verify/paragraph.png' })
} finally {
  await browser.close()
}