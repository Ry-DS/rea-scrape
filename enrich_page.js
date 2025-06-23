const fs = require('fs');
const { chromium } = require('playwright');
// const StealthPlugin = require('playwright-extra-plugin-stealth')
// chromium.use(StealthPlugin())

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
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0',
    locale: 'en-AU',
    viewport: { width: 3440, height: 1440 },
    screen: { width: 3440, height: 1440 },
    extraHTTPHeaders: {
      'accept': '*/*',
      'accept-encoding': 'gzip, br',
      'accept-language': 'en-AU,en;q=0.9,en-US;q=0.8',
      'priority': 'u=1, i',
      'referer': 'https://fingerprint-scan.com/',
      'sec-ch-ua': '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    }
  });

  // Spoof worker context properties
  context.on('worker', async worker => {
    try {
      await worker.evaluate(() => {
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-AU', 'en', 'en-US'] });
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        // WebGL spoofing in workers
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return 'Google Inc. (NVIDIA)';
          if (parameter === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 (0x00002204) Direct3D11 vs_5_0 ps_5_0, D3D11)';
          return getParameter.call(this, parameter);
        };
      });
    } catch (e) {
      // Some workers may not expose navigator, ignore errors
    }
  });

  // Anti-bot fingerprinting spoofing
  await context.addInitScript(() => {
    // Platform
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    // Languages
    Object.defineProperty(navigator, 'languages', { get: () => ['en-AU', 'en', 'en-US'] });
    // Webdriver
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Plugins (realistic PDF plugins, indexable)
    const fakePlugins = [
      {
        name: 'PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
        length: 1
      },
      {
        name: 'Chrome PDF Viewer',
        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
        description: '',
        length: 1
      },
      {
        name: 'Chromium PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: '',
        length: 1
      },
      {
        name: 'Microsoft Edge PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: '',
        length: 1
      },
      {
        name: 'WebKit built-in PDF',
        filename: 'internal-pdf-viewer',
        description: '',
        length: 1
      }
    ];
    function makePluginArray(arr) {
      arr.forEach((p, i) => arr[i] = p);
      arr.item = function(i) { return arr[i]; };
      arr.namedItem = function(name) { return arr.find(p => p.name === name); };
      arr.length = arr.length;
      return arr;
    }
    Object.defineProperty(navigator, 'plugins', {
      get: () => makePluginArray([...fakePlugins])
    });
    // MimeTypes (realistic, indexable)
    const fakeMimeTypes = [
      {
        type: 'application/pdf',
        description: 'Portable Document Format',
        suffixes: 'pdf',
        enabledPlugin: fakePlugins[0]
      },
      {
        type: 'text/pdf',
        description: 'Portable Document Format',
        suffixes: 'pdf',
        enabledPlugin: fakePlugins[0]
      }
    ];
    function makeMimeTypeArray(arr) {
      arr.forEach((m, i) => arr[i] = m);
      arr.item = function(i) { return arr[i]; };
      arr.namedItem = function(type) { return arr.find(m => m.type === type); };
      arr.length = arr.length;
      return arr;
    }
    Object.defineProperty(navigator, 'mimeTypes', {
      get: () => makeMimeTypeArray([...fakeMimeTypes])
    });
    // WebGL Vendor/Renderer
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return 'Google Inc. (NVIDIA)';
      if (parameter === 37446) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3090 (0x00002204) Direct3D11 vs_5_0 ps_5_0, D3D11)';
      return getParameter.call(this, parameter);
    };
  });

  const page = await context.newPage();

  // Intercept all requests to ensure headers match real.txt
  await page.route('**', (route, request) => {
    const headers = {
      ...request.headers(),
      'accept': '*/*',
      'accept-encoding': 'gzip, br',
      'accept-language': 'en-AU,en;q=0.9,en-US;q=0.8',
      'priority': 'u=1, i',
      'referer': 'https://fingerprint-scan.com/',
      'sec-ch-ua': '"Microsoft Edge";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    };
    // Remove headers not in real.txt
    delete headers['cache-control'];
    delete headers['pragma'];
    delete headers['sec-fetch-user'];
    delete headers['upgrade-insecure-requests'];
    route.continue({ headers });
  });

  // Navigate to realestate.com.au and wait for 10 seconds
  // await page.goto('https://www.realestate.com.au', { waitUntil: 'domcontentloaded' });
  await page.goto('https://arh.antoinevastel.com/bots/areyouheadless', { waitUntil: 'domcontentloaded' });
  console.log('Landed on realestate.com.au, waiting 10 seconds...');
  await page.waitForTimeout(1000000);

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