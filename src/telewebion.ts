import ScraperEngine from "./core/ScraperEngine";
import TelewebionScraper from "./scrapers/TelewebionScraper";
import { SCRAPER_BROWSER, ScraperEngineConfigType } from "./core/types";

const config: ScraperEngineConfigType = {
    browser: {
        waitUntil: "networkidle" // Target site uses client side rendering (CSR), wait until the content is loaded
    },
    loadImages: false // Do not download images when loading the page in browser
}
const telewebionScraper = new ScraperEngine(config);
telewebionScraper.attachScraper(TelewebionScraper)
                 .setUrl("https://telewebion.net/space/MovieSeries")
                 .startFromBrowser(SCRAPER_BROWSER.CHROMIUM)
                 .then(() => telewebionScraper.exportJson("telewebion.json"))
                 .catch(console.error)
                 .finally(() => telewebionScraper.terminate());