![Version](https://img.shields.io/badge/Version-1.0.0-pink)

# Node.js Web Scraper
This is a web scraper project, built for Node.js with TypeScript.
Using this tool, you can scrape many websites with basic HTTP request, browser simulation and even HTML file or string.

<!-- TOC -->
* [Node.js Web Scraper](#nodejs-web-scraper)
  * [Browser scraping](#browser-scraping)
    * [Output](#output)
  * [Headless scraping](#headless-scraping)
    * [Output](#output-1)
  * [HTML Scraping (headless)](#html-scraping-headless)
  * [Installation](#installation)
  * [API](#api)
    * [Load scraper engine first](#load-scraper-engine-first)
    * [`setUrl`](#seturl)
    * [`addScraper`](#addscraper)
    * [`addBrowserScraper`](#addbrowserscraper)
    * [`startFromHtml`](#startfromhtml)
    * [`startFromFile`](#startfromfile)
    * [`async startFromBrowser`](#async-startfrombrowser)
    * [`start`](#start)
    * [`saveTo` (headless only)](#saveto-headless-only)
    * [`capture`](#capture)
    * [`dump`](#dump)
    * [`reset`](#reset)
    * [`header`](#header)
    * [`cookie`](#cookie)
  * [Attachable scrapers](#attachable-scrapers)
    * [How to make an attachable scraper?](#how-to-make-an-attachable-scraper)
  * [License (GPL-3.0)](#license-gpl-30)
<!-- TOC -->

## Browser scraping
This feature uses `playwright` library to run a browser process (Chromium or Firefox) on your machine, to scrape websites with dynamic contents or client-side rendering.
```typescript
import ScraperEngine from "./core/ScraperEngine";
import DigikalaScraper from "./scrapers/DigikalaScraper";
import { SCRAPER_BROWSER } from "./core/types";

// Digikala Scraper (browser)
const digikalaScraper = new ScraperEngine();

digikalaScraper.setUrl("https://www.digikala.com/product/dkp-21791906/%DA%A9%D9%85%D9%BE%D8%B1%D8%B3%D9%88%D8%B1%20%D9%87%D9%88%D8%A7%201800%20%D9%88%D8%A7%D8%AA%20%D8%AF%D9%84%DB%8C%DA%A9%D8%B3%20%DA%A9%D8%AF%20BS1800W%20%D9%85%D8%AC%D9%85%D9%88%D8%B9%D9%87%2015%20%D8%B9%D8%AF%D8%AF%DB%8C/?variant_id=80795837&product_id=21791906")
               .attachScraper(DigikalaScraper) // Attach the scraper
               .startFromBrowser(SCRAPER_BROWSER.CHROMIUM) // Start Chromium browser
               .then(() => digikalaScraper.dump()) // Print the final result in the console
               .catch(console.error) // Print the errors (if it has any)
               .finally(() => digikalaScraper.terminate()); // Close the browser so any loading page gets closed with the browser
```
### Output
```javascript
Map(1) {
  'product' => {
    main_image: 'https://dkstatics-public.digikala.com/digikala-products/df54891f015650e6eaf7e98da809f3a6315d6e03_1778443364.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
    title: 'کمپرسور هوا دلیکس مدل BS1800W، توان 1800 وات، فشار 150-250 PSI، دبی 5.1 مترمکعب بر ساعت، موتور یونیورسال، دو سیلندر بدون روغن، کارکرد پیوسته 1 ساعت',
    price_formatted: '۶,۶۹۰,۰۰۰',
    price_formatted_en: '6,690,000',
    price: 6690000,
    rating: 4.1,
    rating_label: '(امتیاز 71 خریدار)',
    rating_count: '71',
    gallery: [
      'https://dkstatics-public.digikala.com/digikala-products/df54891f015650e6eaf7e98da809f3a6315d6e03_1778443364.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
      'https://dkstatics-public.digikala.com/digikala-products/df54891f015650e6eaf7e98da809f3a6315d6e03_1778443364.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
      'https://dkstatics-public.digikala.com/digikala-products/e53f19ea073c5ed4acf985b546e32ca6b2960f19_1778444786.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
      'https://dkstatics-public.digikala.com/digikala-products/d12499e89310ecb6a47b16177929371f9ffc669a_1778444825.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',
      'https://dkstatics-public.digikala.com/digikala-products/85879d3a4bac4c4509734ea6288659737934dc1c_1778444844.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90'
    ]
  }
}
```
If you need the result without printing it, do this code instead:
```typescript
digikalaScraper.setUrl("https://www.digikala.com/product/dkp-21791906/%DA%A9%D9%85%D9%BE%D8%B1%D8%B3%D9%88%D8%B1%20%D9%87%D9%88%D8%A7%201800%20%D9%88%D8%A7%D8%AA%20%D8%AF%D9%84%DB%8C%DA%A9%D8%B3%20%DA%A9%D8%AF%20BS1800W%20%D9%85%D8%AC%D9%85%D9%88%D8%B9%D9%87%2015%20%D8%B9%D8%AF%D8%AF%DB%8C/?variant_id=80795837&product_id=21791906")
   .attachScraper(DigikalaScraper) // Attach the scraper
   .capture(results => { // Add this here to capture the result
       if(results.has("price")) {
           const price = results.get("price");
           // More codes here
       }
   })
   .startFromBrowser(SCRAPER_BROWSER.CHROMIUM) // Start Chromium browser
   .catch(console.error) // Print the errors (if it has any)
   .finally(() => digikalaScraper.terminate()); // Close the browser so any loading page gets closed with the browser
```
The `results` here in `capture` is a Map with type `Map<string, any>` AKA `ScraperResultType`.

## Headless scraping
Headless scraping only lets you scrape data from server-side rendered websites, but it is faster and more memory efficient than browser scraping.
It also gives you a feature to modify headers and cookies to simulate real browser connection and also supports authorization.

Headless scrapers use `cheerio` library as the parser and allows you to find information inside the HTML page.
```typescript
import ScraperEngine from "./core/ScraperEngine";
import GitHubScraper from "./scrapers/GitHubScraper";
import { SCRAPER_BROWSER } from "./core/types";

// GitHub Scraper (headless)
const githubScraper = new ScraperEngine();
githubScraper.setUrl("https://github.com/Ho3ein83/snowflake-db")
             .attachScraper(GitHubScraper)
             .capture(console.log)
             .start();
```
### Output
```javascript
Map(2) {
  'meta' => {
    about: 'SnowflakeDB is an in-memory database library developed by Amatris',
    author: 'Ho3ein83',
    repo_name: 'snowflake-db',
    website: 'https://amatris.com/en',
    forks: 0,
    watchers: 0,
    stars: 1
  },
  'readme' => {
    name: 'Readme.md',
    content: '<article class="markdo' + ... 119222 more characters
  }
}
```

## HTML Scraping (headless)
HTML scraping allows you to extract data from local HTML files or strings, or even connect it to your own page loader or browser.

```typescript
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
           .startFromFile("/path/to/movie.html")
           .catch(console.error)
```
```javascript
Map(1) {
  'movie' => {
    title: 'Game Of Thrones',
    rating: '9.2',
    start_date: '2011',
    end_date: '2019'
  }
}
```

or even from literal strings:
```typescript
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
```

```text
Hello Scraper!
```

## Installation
Clone the repository:
```bash
git clone https://github.com/Ho3ein83/web-scraper
```
`cd` into it:
```bash
cd web-scraper
```
Install dependencies:
```bash
npm install
```
Install browser (only if you need browser scraping feature):
```bash
npx playwright install
```

## API
### Load scraper engine first
Before doing anything, import the scraper engine:
```typescript
import ScraperEngine from "./core/ScraperEngine";
```

Then create a new instance:
```typescript
const myScraper = new ScraperEngine();
```
Pass the options object if needed:
```typescript
// Each option is optional and can be ommited
const options = {
    url: new URL("https://google.com"),
    timeout: 10000,
    auth: credentials, // must match AxiosBasicCredentials or be null
    axiosOptions: axiosOptions, // must match AxiosRequestConfig or be null
    browser: {
        waitUntil: "domcontentloaded" // Can be either "load", "domcontentloaded", "networkidle", "commit"
    }
};
const myScraper = new ScraperEngine(options);
```
Each instance can be used to scrape different URLs with different methods, so you don't need to create a new instance for each scraper.

Then only time you create multiple instances is when you want to do parallel scraping.

### `setUrl`
This method changed the current URL of the scraper:
```typescript
myScraper.setUrl("https://github.com/Ho3ein83/web-scraper");
```

### `addScraper`
Adds a new field scraper. Each field scraper searches the current page and finds the information you need, then returns it and gets added to the result map.
```typescript
myScraper.addScraper("username", $ => {
    const username = $.extract({ data: '#username' });
    return username.data;
})
```
The `$` in the code is `CheerioAPI` object returned from [cheerio.load](https://cheerio.js.org/docs/api/variables/load/) method.
Use this API to search your HTML page. Read [CheerioAPI](https://cheerio.js.org/docs/api/interfaces/cheerioapi/) for more details.
> **Note**: this method only works for **headless** scrapers (and not browser).

### `addBrowserScraper`
Adds a bew field scraper for browser scrapers.
```typescript
myScraper.addBrowserScraper("product", async page => {
    const title = await page.getByTestId("pdp-title").first().innerText();
    const price = await page.getByTestId("pdp-price").first().innerText();
    return {
        title, price
    }
});
```
The `page` argument above is `Page` interface from `playwright` package. Use [this document](https://playwright.dev/docs/api/class-page) to learn more about pages.
> **Note**: this method only works for **browser** scrapers (and not headless).
> 

### `startFromHtml`
Starts the scraping process from an HTML string.
```typescript
myScraper.startFromHtml("<p>Hello World</p>")
```

### `startFromFile`
Starts the scraping process from an HTML file.
```typescript
myScraper.startFromFile("/path/to/page.html")
```

### `async startFromBrowser`
Starts a new browser process and opens a new page with the given URL, then waits until the network state is idle or DOC content is already loaded, then processes the page for scraping.

This function is asynchronous, so you need to either wrap it in an `async` function with `await` or use `then/catch` expression to handle the result.

```typescript
(async function(){
    // Use default browser
    await myScraper.startFromBrowser();
    // or use Firefox:
    // myScraper.startFromBrowser(SCRAPER_BROWSER.FIREFOX);
    // or use Chromium:
    // myScraper.startFromBrowser(SCRAPER_BROWSER.CHROMIUM);
    
    // You need to terminate the browser to free up some memory
    // and release the event loop to prevent blocking your app.
    // If the last scraper page wasn't completely finished loading,
    // it will close that page anyway since it was either scraped
    // or got stuck.
    myScraper.terminate();
}())
```
> **Select a browser:** you must specify the browser you want to use by passing `SCRAPER_BROWSER.FIREFOX` or `SCRAPER_BROWSER.CHROMIUM` to this method or leave it empty to use default browser.

> **Install browsers:** browsers must be already installed to get this method working, you can install them by running `npx playwright install` command.

### `start`
Starts a headless scraper.
```typescript
myScraper.start();
```
Since this method is synchronous, if you need to handle successful or failed operations, you need to pass two callbacks to the method, the first one is success callback and second one is failure callback:
```typescript
function onSuccess($){
    // $ is either CheerioAPI interface or null
}
function onFail(error){
    console.log(error); // error is string
}
myScraper.start(onSuccess, onFail);
```

### `saveTo` (headless only)
This method allows you to save the whole HTML page into a file.
```typescript
myScraper.setUrl("https://google.com")
         .saveTo("google.html");
```

### `capture`
Add a capture listener. The give callback gets called everytime a new result gets generated.

All listened callbacks gets removed after calling `myScraper.reset()`.

```typescript
myScraper.capture(result => {
    // result is a `Map` object
    if(result.has("name"))
        console.log(result.get("name"));
});
```
or simply:
```typescript
// Prints the result to the console
myScraper.capture(console.log);
```

### `dump`
Prints the latest result to the console.
```typescript
myScraper.dump();
```

### `reset`
Resets all headers, cookies, headless scrapers, browser scrapers, latest result, capture listeners and config and terminates all open browsers unless you pass `false` to it.
```typescript
myScraper.reset(); // Terminate the browser and then reset everything 
myScraper.reset(false); // Just reset everything, keep the browser open 
```

### `header`
Gets the header helper:
```typescript
// Set
myScraper.header.set("Authorization", "Bearer <token>");

// Get
const accept = myScraper.header.get("Accept");

// Loads from string
myScraper.header.fromString(`
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br, zstd
`);

// Delete
myScraper.header.unset("Accept");

// Print in the console
myScraper.header.dump();

// Export as object
const headers = myScraper.header.export();
console.log(headers);
/*
   Output example:
   {
     Accept: "text/html",
     "Accept-Language": "en-US,en;q=0.9"
   }
*/

// Clears every header
myScraper.header.clear();
```

### `cookie`
Gets the cookie helper:
```typescript
// Set
myScraper.cookie.set("session", "me-abc1234");

// Get
const token = myScraper.cookie.get("token");

// Load from string
myScraper.cookie.fromString("session=me-abc1234; token=my-token");

// Delete
myScraper.cookie.unset("session");

// Print in the console
myScraper.cookie.dump();

// Export as object
const cookies = myScraper.cookie.export();
console.log(cookies);
/*
   Output example:
   session=me-abc1234; token=my-token
*/

// Clears every cookie
myScraper.cookie.clear();
```

## Attachable scrapers
Attachable scrapers are just an object that identifies scrapers to the engine, which helps it understand the behavior of that scraper and validate the URL before scraping.

They also help you manage them much easier by attaching and detaching scrapers, which makes switching between them much easier.

### How to make an attachable scraper?
Create a JavaScript file (preferably in `src/scrapers` directory):
```javascript
import ScraperEngine from "../core/ScraperEngine";

const GitHubScraper = {
    name: "GitHub",
    type: "headless", // can be "browser" or "both" too
    run: engine => {
        // ...
    },
    description: "Extract basic information of a GitHub repository",
    urlFormat: /^https:\/\/github.com\/.*/
};

export default GitHubScraper;
```
Or in TypeScript:
```typescript
import { ScraperInfoType } from "../core/types";
import ScraperEngine from "../core/ScraperEngine";

const GitHubScraper: ScraperInfoType = {
    name: "GitHub",
    type: "headless", // can be "browser" or "both" too
    run: (engine: ScraperEngine) => {
        // ...
    },
    description: "Extract basic information of a GitHub repository",
    urlFormat: /^https:\/\/github.com\/.*/
};

export default GitHubScraper;
```

Now you can access to the engine easily inside `run` function. Register scraper fields with `addScraper` or `addBrowserScraper` methods:
```typescript
import { ScraperInfoType } from "../core/types";
import ScraperEngine from "../core/ScraperEngine";

const GitHubScraper: ScraperInfoType = {
    name: "GitHub",
    type: "headless", // can be "browser" or "both" too
    run: (engine: ScraperEngine) => {
        
        engine.addScraper("meta", ($: CheerioAPI) => {
            // Use CheerioAPI to extract information from the page
            return result; // Then retrun the result, any data type is acceptable
        });
        
        engine.addScraper("files", ($: CheerioAPI) => {
            // Use CheerioAPI to extract information from the page
            return result; // Then retrun the result, any data type is acceptable
        });
        
        // Another scraper with this name is already registered, but you can
        // add it again and modify previous value and return it again
        engine.addScraper("files", ($: CheerioAPI, previousValue: any) => {
            // Manipulate previousValue to update the value from previous scraper
            return previousValue; // Then retrun the result, any data type is acceptable
        });

        // Browser scrapers can be added the same way
        engine.addBrowserScraper("product", async (page: Page, previousValue) => {
            // Manipulate previousValue to update the value from previous scraper
            return previousValue; // Then retrun the result, any data type is acceptable
        });
        
    },
    description: "Extract basic information of a GitHub repository",
    urlFormat: /^https:\/\/github.com\/.*/
};

export default GitHubScraper;
```

## License (GPL-3.0)
Any modification, redistribution or commercial use is allowed. Contributions are welcome as well.
[Read more](/License.txt)