const puppeteer = require('puppeteer');

async function scrapeVideo(url) {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  try {
    await page.goto(url);

    // Accept cookies if the button exists
    const acceptCookies = await page.$('.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.iMLaPd');
    if (acceptCookies) {
      await acceptCookies.click();
    }

    // Wait for the video button and click it
    const videoButton = await page.waitForSelector('#tabsContent > yt-tab-group-shape > div.yt-tab-group-shape-wiz__tabs > yt-tab-shape:nth-child(2)');
    await videoButton.click();
    
    // Wait for video titles and metadata to load
    await page.waitForSelector('#video-title');
    await page.waitForSelector('#metadata-line');

    // Scroll to load more videos
    const scrollDelay = 2000;
    const maxScrolls = 10;

    for (let scrollCount = 0; scrollCount < maxScrolls; scrollCount++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      await new Promise(resolve => setTimeout(resolve, scrollDelay));    }

    // Extract video data using #metadata-line and #video-title
    const videoElements = await page.$$('#metadata-line');
    const titleElements = await page.$$('#video-title');
    const metadataItems = [];

    for (let i = 0; i < videoElements.length; i++) {
      const viewCountElement = await videoElements[i].$('span:nth-child(3)');
      const publicationDateElement = await videoElements[i].$('span:nth-child(4)');
      const titleElement = titleElements[i];

      if (viewCountElement && publicationDateElement) {
        const viewCountProperty = await viewCountElement.getProperty('textContent');
        const publicationDateProperty = await publicationDateElement.getProperty('textContent');
        const title = await titleElement.evaluate(el => el.textContent);
      
        const viewCount = await viewCountProperty.jsonValue();
        const publicationDate = await publicationDateProperty.jsonValue();
      
        metadataItems.push({
          title,
          viewCount,
          publicationDate
        });
      }
    }

    await browser.close();

    return {
      metadataItems
    };
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  scrapeVideo
};







