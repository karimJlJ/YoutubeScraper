const { scrapeVideo } = require('./video-scrape'); // Remplacez 'votre_scraper' par le chemin correct vers votre module de scraper.

async function testScraper() {
    const url = 'https://www.youtube.com/@ninjascripter5214/featured'; // Remplacez par l'URL que vous souhaitez scraper.

    try {
        const scrapedData = await scrapeVideo(url);
        console.log('Données extraites :', scrapedData);
    } catch (error) {
        console.error('Une erreur est survenue :', error);
    }
}

testScraper();
