import ScraperEngine from "./core/ScraperEngine";
import DigikalaScraper from "./scrapers/DigikalaScraper";
import { SCRAPER_BROWSER } from "./core/types";
import GitHubScraper from "./scrapers/GitHubScraper";

// GitHub Scraper (headless)
const githubScraper = new ScraperEngine();
githubScraper.setUrl("https://github.com/Ho3ein83/snowflake-db")
             .attachScraper(GitHubScraper)
             .capture(console.log)
             .start();

// Digikala Scraper (browser)
const digikalaScraper = new ScraperEngine();

digikalaScraper.setUrl("https://www.digikala.com/product/dkp-21791906/%DA%A9%D9%85%D9%BE%D8%B1%D8%B3%D9%88%D8%B1%20%D9%87%D9%88%D8%A7%201800%20%D9%88%D8%A7%D8%AA%20%D8%AF%D9%84%DB%8C%DA%A9%D8%B3%20%DA%A9%D8%AF%20BS1800W%20%D9%85%D8%AC%D9%85%D9%88%D8%B9%D9%87%2015%20%D8%B9%D8%AF%D8%AF%DB%8C/?variant_id=80795837&product_id=21791906")
               .attachScraper(DigikalaScraper) // Attach the scraper
               .capture(results => {
                   if(results.has("price")) {
                       const price = results.get("price");
                       // More codes here
                   }
               })
               .startFromBrowser(SCRAPER_BROWSER.CHROMIUM) // Start Chromium browser
               .then(() => digikalaScraper.dump()) // Print the final result in the console
               .catch(console.error) // Print the errors (if it has any)
               .finally(() => digikalaScraper.terminate()); // Close the browser so any loading page gets closed with the browser

// HTML scraper (headless)
const htmlScraper = new ScraperEngine();

htmlScraper.capture(console.log)
           .addScraper("movie", $ => {
               const title = $.extract({ data: '.my-movie > .title' }).data;
               const rating = $.extract({ data: '.my-movie > .rating' }).data;
               const startDate = $.extract({ data: '.my-movie > .start-date' }).data;
               const endDate = $.extract({ data: '.my-movie > .end-date' }).data;
               return {
                   title, rating,
                   start_date: startDate,
                   end_date: endDate
               }
           })
           .startFromFile("/home/hossein/PhpstormProjects/web-scraper/src/example.html")
           .catch(console.error)

// Resets an old instance to reuse it, every scraper, event, and config will be reset
// Also if any browser is open it'll get terminated first
htmlScraper.reset();

// Local HTML file scraper (headless)
htmlScraper.capture(map => console.log(map.get("extracted_text")))
           .addScraper("extracted_text", $ => {
               return $.extract({ data: '#text' }).data?.toString() ?? "";
           })
           .startFromHtml('<p id="text">Hello Scraper!</p>')
           .catch(console.error)