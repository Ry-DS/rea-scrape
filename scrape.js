const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = 'https://www.realestate.com.au/rent/with-2-bedrooms-between-525-1200/list-1?maxBeds=2&availableBefore=2025-07-21&misc=ex-deposit-taken&keywords=air%20conditioning&checkedFeatures=air%20conditioning&boundingBox=-33.83848384559149%2C151.1269145127142%2C-33.92527322748691%2C151.30758811195736&activeSort=list-date&sourcePage=rea:rent:srp-map&sourceElement=tab-headers';
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
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
    // Set cookies as in the curl command
    await context.addCookies([
      {
        name: 'Country', value: 'AU', domain: 'www.realestate.com.au', path: '/'
      },
      { name: 'ew_bkt', value: '50', domain: 'www.realestate.com.au', path: '/' },
      { name: 'reauid', value: 'c5b42e1743782700310150689601000099533d00', domain: 'www.realestate.com.au', path: '/' },
      { name: 'split_audience', value: 'd', domain: 'www.realestate.com.au', path: '/' },
      { name: 'AMCVS_341225BE55BBF7E17F000101%40AdobeOrg', value: '1', domain: 'www.realestate.com.au', path: '/' },
      { name: 's_cc', value: 'true', domain: 'www.realestate.com.au', path: '/' },
      { name: 'KFC', value: 'V1GbZx5aHqeASyGb9+LxgMaPPSKTAqW7g1IpvaeQkqY=|1750073766127', domain: 'www.realestate.com.au', path: '/' },
      { name: 'KP_UIDz-ssn', value: '0B3K8Q67Hzgclw5epbxS1blc5arKem8TinmHHC5GFZmn7R5QmXIcYDngC5FzDW55w8zOsoaia6lcky1ohZNRyj2axW4Je8rpcKg9j8QIDZFVJvE5UfW3f7LjDw4FtRVJueJ9culbu9DQWFGd5matZ95QMLfwWfhAntxWc8wN', domain: 'www.realestate.com.au', path: '/' },
      { name: 'KP_UIDz', value: '0B3K8Q67Hzgclw5epbxS1blc5arKem8TinmHHC5GFZmn7R5QmXIcYDngC5FzDW55w8zOsoaia6lcky1ohZNRyj2axW4Je8rpcKg9j8QIDZFVJvE5UfW3f7LjDw4FtRVJueJ9culbu9DQWFGd5matZ95QMLfwWfhAntxWc8wN', domain: 'www.realestate.com.au', path: '/' },
      { name: 'pageview_counter.srs', value: '2', domain: 'www.realestate.com.au', path: '/' },
      { name: 's_nr30', value: '1750073766714-New', domain: 'www.realestate.com.au', path: '/' },
      { name: 'utag_main', value: 'v_id:01977884969d000cda971058a1120507d004407500fb8$_sn:1$_se:16$_ss:0$_st:1750075566718$ses_id:1750073644701%3Bexp-session$_pn:4%3Bexp-session$vapi_domain:realestate.com.au$_prevpage:rea%3Arent%3Asearch%20result%20-%20list%3Bexp-1750077366722$dc_visit:1$dc_event:12%3Bexp-session', domain: 'www.realestate.com.au', path: '/' },
      { name: 'legs_sq', value: '%5B%5BB%5D%5D', domain: 'www.realestate.com.au', path: '/' },
      { name: 's_sq', value: '%5B%5BB%5D%5D', domain: 'www.realestate.com.au', path: '/' },
      { name: 'AMCV_341225BE55BBF7E17F000101%40AdobeOrg', value: '179643557%7CMCIDTS%7C20256%7CMCMID%7C31465645941384562774528768727287357847%7CMCAID%7CNONE%7CMCOPTOUT-1750081029s%7CNONE%7CvVersion%7C5.5.0', domain: 'www.realestate.com.au', path: '/' }
    ]);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log('Waiting 20 seconds to simulate user...');
    await page.waitForTimeout(20000);
    const html = await page.content();
    fs.writeFileSync('page1.html', html);
    console.log('Saved page1.html');

    let pageNum = 1;
    while (true) {
      await page.waitForSelector('[data-testid="ResidentialCard"]', { timeout: 10000 });
      const propertyCards = await page.$$('[data-testid="ResidentialCard"]');
      const results = [];
      for (const card of propertyCards) {
        const price = await card.$eval('.property-price', el => el.textContent.trim());
        const address = await card.$eval('.residential-card__address-heading a span', el => el.textContent.trim());
        const url = await card.$eval('.residential-card__address-heading a', el => el.href);
        const imageUrl = await card.$eval('[data-testid="PropertyImage"]', el => el.getAttribute('data-url'));
        const type = await card.$eval('ul.residential-card__primary > p:last-child', el => el.textContent.trim());
        const features = await card.$$eval('ul.residential-card__primary li', lis => lis.map(li => ({
          label: li.getAttribute('aria-label'),
          value: li.querySelector('p')?.textContent.trim()
        })));
        let bedrooms = '', bathrooms = '', carspaces = '';
        for (const f of features) {
          if (f.label && f.label.includes('bedroom')) bedrooms = f.value;
          if (f.label && f.label.includes('bathroom')) bathrooms = f.value;
          if (f.label && f.label.includes('car')) carspaces = f.value;
        }
        results.push({ price, address, bedrooms, bathrooms, carspaces, type, imageUrl, url });
      }
      fs.writeFileSync(`page${pageNum}.json`, JSON.stringify(results, null, 2));
      console.log(`Saved page${pageNum}.json`);
      // Try to click the Next button (robust selector for button or a[aria-label])
      const nextBtn = await page.$('button[aria-label="Next"],button[aria-label*="next page"],a[aria-label="Next"],a[aria-label*="next page"]');
      if (!nextBtn) {
        console.log('No Next button found, stopping.');
        break;
      }
      const disabled = await nextBtn.getAttribute('disabled');
      if (disabled !== null) {
        console.log('Next button is disabled, stopping.');
        break;
      }
      await nextBtn.click();
      pageNum++;
      console.log('Waiting 20 seconds to simulate user...');
      await page.waitForTimeout(20000);
    }
  } catch (err) {
    console.error('Error during scraping:', err);
  } finally {
    if (browser) await browser.close();
  }
})(); 