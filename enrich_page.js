const fs = require('fs');
const { chromium } = require('playwright');

async function enrichProperty(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  let title = null, description = null, available = null, inspections = [];
  try {
    title = await page.$eval('h2.Text__Typography-sc-1103tao-0.cmSYNV', el => el.textContent.trim());
    console.log('  title:', title);
  } catch (e) { console.log('  title not found'); }
  try {
    description = await page.$eval('.property-description__content', el => el.textContent.trim());
    console.log('  description:', description ? description.slice(0, 40) + '...' : null);
  } catch (e) { console.log('  description not found'); }
  try {
    available = await page.$$eval('p.Text__Typography-sc-1103tao-0.kONa-DJ', els => {
      const found = els.find(e => e.textContent.trim().startsWith('Available'));
      return found ? found.textContent.trim() : null;
    });
    console.log('  available:', available);
  } catch (e) { console.log('  available not found'); }
  try {
    inspections = await page.$$eval('p.Text__Typography-sc-1103tao-0.kONa-DJ', els =>
      els.filter(e => e.textContent.trim().startsWith('Inspection')).map(e => e.textContent.trim())
    );
    console.log('  inspections:', inspections);
  } catch (e) { console.log('  inspections not found'); }
  console.log('Waiting 30 seconds...');
  await page.waitForTimeout(30000);
  return { title, description, available, inspections };
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node enrich_page.js <pageN.json>');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
  const enriched = [];
  const outPath = path.replace(/\.json$/, '_enriched.json');

  // Launch browser and context ONCE
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0',
    locale: 'en-AU',
    extraHTTPHeaders: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-AU,en;q=0.9,en-US;q=0.8',
      'cache-control': 'max-age=0',
      'priority': 'u=0, i',
      'referer': 'https://www.realestate.com.au/rent/with-2-bedrooms-between-525-1200/map-1?maxBeds=2&availableBefore=2025-07-21&misc=ex-deposit-taken&keywords=air%20conditioning&checkedFeatures=air%20conditioning&boundingBox=-33.83848384559149,151.1269145127142,-33.92527322748691,151.30758811195736&activeSort=list-date&sourcePage=map&sourceElement=location-tile-search',
      'sec-ch-ua': '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    }
  });
  const page = await context.newPage();

  for (const prop of data) {
    console.log('Enriching', prop.url);
    let extra = {};
    try {
      extra = await enrichProperty(page, prop.url);
    } catch (e) {
      console.error('Failed to enrich', prop.url, e);
    }
    enriched.push({ ...prop, ...extra });
    // Save progress after each property
    fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));
    console.log('Progress saved to', outPath);
  }

  await browser.close();
  console.log('All done. Saved', outPath);
}

main(); 