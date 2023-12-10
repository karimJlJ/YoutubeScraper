const puppeteer = require('puppeteer');

async function scrapeChannel(url) {
    const browser = await puppeteer.launch({
        headless: false // disable headless mode for debugging
    });
    const page = await browser.newPage();

    // Naviguer vers l'URL
    await page.goto(url);

    const acceptCookiesButton = await page.$('.VfPpkd-LgbsSe.VfPpkd-LgbsSe-OWXEXe-k8QpJ.VfPpkd-LgbsSe-OWXEXe-dgl2Hf.nCP5yc.AjY5Oe.DuMIQc.iMLaPd');

    if (acceptCookiesButton) {
        await acceptCookiesButton.click();
    } else {
        console.log("Bouton d'acceptation des cookies introuvable.");
    }
    

    const timeout = 30000;

    try {
        await page.waitForSelector('yt-formatted-string#text', { timeout });
        await page.waitForSelector('img#img');
        await page.waitForSelector('#subscriber-count');
        await page.waitForSelector('#videos-count');

        // Do something with the extracted data

    } catch (error) {
        console.error(`Timeout waiting for selector: ${error}`);
    }

    // Extract the channel name
    const nameElement = await page.$('yt-formatted-string#text');
    const nameProperty = await nameElement.getProperty('textContent');
    const name = await nameProperty.jsonValue();

    // Extract the URL of the image
    const imageElement = await page.$('img#img');
    const imageSrcProperty = await imageElement.getProperty('src');
    const avatarURL = await imageSrcProperty.jsonValue();
    
    // Extract the subscriber count
        const subscriberCountElement = await page.$('#subscriber-count');
        const subscriberCountProperty = await subscriberCountElement.getProperty('textContent');
        const subscriberCount = await subscriberCountProperty.jsonValue();

    // Extract the video count
        const videoCountElement = await page.$('#videos-count');
        const videoCountProperty = await videoCountElement.getProperty('textContent');
        const videosCount = await videoCountProperty.jsonValue();


    await browser.close();

    return { name, avatarURL ,subscriberCount, videosCount };
}

module.exports = {
    scrapeChannel
}

