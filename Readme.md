![Version](https://img.shields.io/badge/Version-1.1.0-purple)
![Last Update](https://img.shields.io/badge/Updated%20at-25%20Oct%202026-blue)

# Node.js Web Scraper
This is a web scraper project, built for Node.js with TypeScript.
Using this tool, you can scrape many websites with basic HTTP request, browser simulation and even HTML file or string.

<!-- TOC -->
* [Node.js Web Scraper](#nodejs-web-scraper)
  * [Installation](#installation)
    * [Installing the browser (optional)](#installing-the-browser-optional)
  * [Browser scraping](#browser-scraping)
    * [Output](#output)
  * [Headless scraping](#headless-scraping)
    * [Output](#output-1)
  * [HTML Scraping (headless)](#html-scraping-headless)
  * [API](#api)
    * [Load scraper engine first](#load-scraper-engine-first)
    * [Options](#options)
  * [Methods](#methods)
    * [`setUrl`](#seturl)
    * [`addScraper`](#addscraper)
    * [`addBrowserScraper`](#addbrowserscraper)
    * [`startFromHtml`](#startfromhtml)
    * [`startFromFile`](#startfromfile)
    * [`async startFromBrowser`](#async-startfrombrowser)
    * [`async scrapeNewPage` (simultaneous scraping)](#async-scrapenewpage-simultaneous-scraping)
    * [`start`](#start)
    * [`saveTo` (headless only)](#saveto-headless-only)
    * [`capture`](#capture)
    * [`dump`](#dump)
    * [`exportJson`](#exportjson)
    * [`reset`](#reset)
    * [`async promiseAllWithProgress`](#async-promiseallwithprogress)
    * [`header`](#header)
    * [`cookie`](#cookie)
  * [Attachable scrapers](#attachable-scrapers)
    * [How to make an attachable scraper?](#how-to-make-an-attachable-scraper)
  * [License (GPL-3.0)](#license-gpl-30)
<!-- TOC -->

## Installation

Install the package `@ho3ein.ie/web-scraper` using `npm` or add it to your dependencies.
```shell
npm i @ho3ein.ie/web-scraper
```
Import it into your project:
```javascript
// ESM
import { ScraperEngine } from "@ho3ein.ie/web-scraper";
```
```javascript
// CommonJS
const { ScraperEngine } = require("@ho3ein.ie/web-scraper");
```

### Installing the browser (optional)
To use browser scraping feature you must install **Chromium** or **Firefox** browser by running these two commands:
```shell
"npm i playwright
```
then:
```shell
npx playwright install
```

## Browser scraping
This feature uses `playwright` library to run a browser process (Chromium or Firefox) on your machine, to scrape websites with dynamic contents or client-side rendering.
```typescript
const { ScraperEngine, DigikalaScraper, SCRAPER_BROWSER } = require("@ho3ein.ie/web-scraper");

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

-----------

## Headless scraping
Headless scraping only lets you scrape data from server-side rendered websites, but it is faster and more memory efficient than browser scraping.
It also gives you a feature to modify headers and cookies to simulate real browser connection and also supports authorization.

Headless scrapers use `cheerio` library as the parser and allows you to find information inside the HTML page.
```typescript
const { ScraperEngine, GitHubScraper } = require("@ho3ein.ie/web-scraper");

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

----------

## HTML Scraping (headless)
HTML scraping allows you to extract data from local HTML files or strings, or even connect it to your own page loader or browser.

```javascript
const { ScraperEngine } = require("@ho3ein.ie/web-scraper");

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

-----------

## API
### Load scraper engine first
Before doing anything, import the scraper engine:
```typescript
import { ScraperEngine } from "@ho3ein.ie/web-scraper";
```
or:
```typescript
const { ScraperEngine } = require("@ho3ein.ie/web-scraper");
```

Then create a new instance:
```typescript
const myScraper = new ScraperEngine();
```

### Options
Pass the options object if needed:
```typescript
// Each option is optional and can be ommited
const options = {
    url: "https://google.com",
    // url: new URL("https://google.com"), // Also valid
    timeout: 10000,
    auth: credentials, // must match AxiosBasicCredentials or be null
    axiosOptions: axiosOptions, // must match AxiosRequestConfig or be null
    browser: {
        waitUntil: "domcontentloaded" // Can be either "load", "domcontentloaded", "networkidle", "commit"
    }
};
const myScraper = new ScraperEngine(options);
```

|  Option Name   |                                                                                Description                                                                                |               Type               | Default | Optional |
|:--------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------:|:-------:|:--------:|
|     `url`      |                                                                           Target URL to scrape                                                                            |    `string` / `URL` / `null`     |  null   |  ✅️ Yes  |
|   `timeout`    |                                              Timeout (in milliseconds) for Axios and GET requests (not the browser timeout)                                               |             `number`             |  10000  |  ✅️ Yes  |
|  `loadImages`  | Whether to download images when loading a page in browser. Set it to `true` only if you want to take a browser screenshot, otherwise it can slow down the loading process |            `boolean`             |  false  |  ✅️ Yes  |
|     `auth`     |                                            Axios authentication object. Only needed if the target site requires authentication                                            |     `AxiosBasicCredentials`      |  none   |  ✅️ Yes  |
| `axiosOptions` |                                      Axios options object. See more details [here](https://axios.rest/pages/advanced/request-config)                                      |       `AxiosRequestConfig`       |  none   |  ✅️ Yes  |
|   `browser`    |                                                            Browser configuration object. (see the table below)                                                            | `ScraperEngineBrowserConfigType` |  none   |  ✅️ Yes  |

|                                                                                                                                                                                                                                                                                                                                                                                                                      ScraperEngineBrowserConfigType                                                                                                                                                                                                                                                                                                                                                                                                                      |
|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| <table><tr><th>Optionn Name</th><th>Description</th><th>Type</th><th>Default</th><th>Optional</th></tr><tr><td align="center">`waitUntil`</td><td align="center">Specified when to start scraping, if the page uses CSR or Ajax and the content is being rendered with JavaScript in the browser, use `"networkidle"`, otherwise you can use `"domcontentloaded"` for faster scraping.</td><td align="center">`"load"` / `"domcontentloaded"` / `"networkidle"` / `"commit"`</td><td align="center">`"domcontentloaded"`</td><td align="center">✅️ Yes</td></tr><tr><td align="center">`timeout`</td><td align="center">The browser timeout (in milliseconds) before the page gets to the desired state (e.g: networkidle).</td><td align="center">`number`</td><td align="center">Browser default timeout (~30 seconds)</td><td align="center">✅️ Yes</td></tr></table> |

Each instance can be used to scrape different URLs with different methods, so you don't need to create a new instance for each scraper.

Then only time you create multiple instances is when you want to do parallel scraping or use multiple services (without confusion).

-----------

## Methods

### `setUrl`
This method changed the current URL of the scraper:
```typescript
myScraper.setUrl("https://github.com/Ho3ein83/web-scraper");
```

-----------

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

-----------

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

-----------

### `startFromHtml`
Starts the scraping process from an HTML string.
```typescript
myScraper.startFromHtml("<p>Hello World</p>")
```

-----------

### `startFromFile`
Starts the scraping process from an HTML file.
```typescript
myScraper.startFromFile("/path/to/page.html")
```

-----------

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

-----------

### `async scrapeNewPage` (simultaneous scraping)
This method opens a new browser page and starts a new scraping process mid-work. For example, you extract IMDB IDs from a website, then you start scraping the details about those titles by their IDs, then group them back and finish the process and the engine cleans everything up after termination.

JavaScript example:
```javascript
// ImdbScraper.js

// In TypeScript:
// import { Page } from "playwright";
// async function extractImdbInfo(page: Page){...}

async function extractImdbInfo(page){
    // Extract data from `page`
    // ...
    return {
        imdb_id: movieTconst,
        title: movieTitle,
        poster: posterUrl,
        rating: movieRating,
        // ...
    }
}

const ImdbScraper = {
    name: "IMDB",
    description: "Scrape IMDB movies from an article",
    type: "browser",
    run: engine => {

        // Need a parent scraper
        engine.addBrowserScraper("movies", async (page: Page) => {
            
          const results = {};

          const imdbIds = [];
          // Extract IMDB IDs (tconst) from an article and add them to `imdbIds`
          // ...
          const promises = [];
          
          // Create a new job for each item
          // Movie IDs were extracted from "example.com" but
          // their information are going to be extracted from "imdb.com"
          for(const tconst of imdbIds){
              const url = "https://www.imdb.com/title/" + tconst;
              promises.push(engine.scrapeNewPage(url, extractImdbInfo));
              // Or pass arguments to the callback:
              // promises.push(engine.scrapeNewPage(url, async (page) => await extractImdbInfo(tconst, page));
          }
          
          // Scrape 3 URLs at a time
          const maxTabs = 3;
          const all = await engine.promiseAllWithProgress(promises, maxTabs);

          // Parse the result
          for(const item of all){
              result[item.id] = {
                  title: item.title,
                  poster: item.poster,
                  rating: item.rating
              };
          }
          
          return results;
          
        });
        
    },
    urlFormat: /https:\/\/example.com\/.*/,
}

export default ImdbScraper;
```
```javascript
// index.js
import ImdbScraper from "./ImdbScraper";

const config = {
  browser: {
    waitUntil: "networkidle"
  },
  loadImages: false
}

const myScraper = new ScraperEngine(config);
myScraper.attachScraper(ImdbScraper)
         .setUrl("https://example.com/some-movie-article")
         .startFromBrowser(SCRAPER_BROWSER.CHROMIUM)
         .then(() => myScraper.exportJson("movies.json")) // Dumps the result to a JSON file
         .catch(console.error)
         .finally(() => myScraper.terminate()); // Don't forget to terminate
```

-----------

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

-----------

### `saveTo` (headless only)
This method allows you to save the whole HTML page into a file.
```typescript
myScraper.setUrl("https://google.com")
         .saveTo("google.html");
```

-----------

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

-----------

### `dump`
Prints the latest result to the console.
```typescript
myScraper.dump();
```

-----------

### `exportJson`
Exports the final result and saves it into a JSON file.
```typescript
myScraper.exportJson("data.json");
```

-----------

### `reset`
Resets all headers, cookies, headless scrapers, browser scrapers, latest result, capture listeners and config and terminates all open browsers unless you pass `false` to it.
```typescript
myScraper.reset(); // Terminate the browser and then reset everything 
myScraper.reset(false); // Just reset everything, keep the browser open 
```

-----------

### `async promiseAllWithProgress`
Splits a list of promises into a chunk and executes them simultaneously and reports the progress back.
Example:

```javascript
const promises = [];
for(const url of urls){
    const job = myScraper.scrapeNewPage(url, myCallback);
    promises.push(job);
}
const maxTabs = 3; // Open 3 tabs at a time
const onProgress = (completed, total) => {
  // Output example: Completed 3/8
  console.log("Completed " + completed + "/" + total);
}
const results = await myScraper.promiseAllWithProgress(promises, maxTabs, onProgress);
```

-----------

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

-----------

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

-----------

## Attachable scrapers
Attachable scrapers are just an object that identifies scrapers to the engine, which helps it understand the behavior of that scraper and validate the URL before scraping.

They also help you manage them much easier by attaching and detaching scrapers, which makes switching between them much easier.

-----------

### How to make an attachable scraper?
Create a JavaScript file (preferably in `src/scrapers` directory):
```javascript
const { ScraperEngine } = require("@ho3ein.ie/web-scraper");

const GitHubScraper = {
    name: "GitHub",
    type: "headless", // Allowed options are: "headless" / "browser" / "both"
    run: engine => {
        // ...
    },
    description: "Extract basic information of a GitHub repository",
    urlFormat: /^https:\/\/github.com\/.*/ // Can be validated later, not used in the current version
};

export default GitHubScraper;
```
Or in TypeScript:
```typescript
const { ScraperEngine, ScraperInfoType } = require("@ho3ein.ie/web-scraper");

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
const { ScraperEngine, ScraperInfoType } = require("@ho3ein.ie/web-scraper");

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

-----------

## License (GPL-3.0)
Any modification, redistribution or commercial use is allowed. Contributions are welcome as well.
[Read more](/License.txt)