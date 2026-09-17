import axios from "axios";
import fs from "fs";

import ScraperHeaders from "./ScraperHeaders";
import ScraperCookie from "./ScraperCookie";
import { BrowserScraperCallableType, SCRAPER_BROWSER, ScraperCallableType, ScraperEngineConfigType, ScraperInfoType, ScraperResultType } from "./types";
import { CheerioAPI, load } from "cheerio";
import { Browser, chromium, firefox } from "playwright";

export default class ScraperEngine {

    #header: ScraperHeaders;

    #cookie: ScraperCookie;

    #config: ScraperEngineConfigType;

    #scrapers: { [scraperName: string]: ScraperCallableType[] } = {};

    #browserScrapers: { [scraperName: string]: BrowserScraperCallableType[] } = {};

    #results: ScraperResultType;

    #captureListeners: ((result: ScraperResultType) => void)[];

    #browser: Browser | null;

    #browserType: SCRAPER_BROWSER;

    readonly DEFAULT_CONFIG: ScraperEngineConfigType = {
        url: null,
        timeout: 10000,
        browser: {
            waitUntil: "domcontentloaded"
        }
    };

    constructor(config: ScraperEngineConfigType = {}){

        this.#config = Object.assign(config, this.DEFAULT_CONFIG);

        // noinspection DuplicatedCode
        this.#header = new ScraperHeaders();
        this.#cookie = new ScraperCookie();
        this.#scrapers = {};
        this.#browserScrapers = {};
        this.#results = new Map();
        this.#captureListeners = [];
        this.#browser = null;
        this.#browserType = SCRAPER_BROWSER.NONE;

    }

    setUrl(url: string | URL | null): this{
        if(typeof url === "string")
            url = new URL(url);
        this.#config.url = url;
        return this;
    }

    startFromHtml(html: string): Promise<CheerioAPI>{

        return new Promise((resolve, reject) => {

            const $ = load(html);

            for(let scraper of Object.entries(this.#scrapers)){
                const [name, callbacks] = scraper;
                let lastValue = undefined;
                for(const callback of callbacks)
                    lastValue = callback($, lastValue);
                this.#results.set(name, lastValue);
            }

            this.callCapture();

            resolve($);

        });

    }

    startFromFile(file: string): Promise<CheerioAPI>{
        if(!fs.existsSync(file))
            return Promise.reject("Input file doesn't exist");
        const html = fs.readFileSync(file);
        return this.startFromHtml(html.toString());
    }

    async startFromBrowser(browserId: SCRAPER_BROWSER = SCRAPER_BROWSER.CHROMIUM){


        if(browserId === SCRAPER_BROWSER.CHROMIUM) {
            if(this.#browser && this.#browserType !== SCRAPER_BROWSER.CHROMIUM)
                this.terminate();
            this.#browser = await chromium.launch();
        }
        else if(browserId === SCRAPER_BROWSER.FIREFOX) {
            if(this.#browser && this.#browserType !== SCRAPER_BROWSER.FIREFOX)
                this.terminate();
            this.#browser = await firefox.launch();
        }
        else{
            this.terminate();
        }

        if(this.#browser === null)
            return Promise.reject("No browser selected.");

        const url = this.#config.url?.toString();
        if(!url)
            return Promise.reject("No URL to scrape.");

        const page = await this.#browser.newPage();
        await page.goto(
            url,
            { waitUntil: this.#config.browser?.waitUntil || "domcontentloaded" }
        );

        for(let scraper of Object.entries(this.#browserScrapers)){
            const [name, callbacks] = scraper;
            let lastValue = undefined;
            for(const callback of callbacks)
                lastValue = await callback(page, lastValue);
            this.#results.set(name, lastValue);
        }

        await page.close();

        this.callCapture();

    }

    start(onSuccess: (($: CheerioAPI) => any) | null = null, onError: ((error: string) => any) | null = null){

        this.fetchPage().then(response => {

            this.startFromHtml(response.data)
                .then(onSuccess)
                .catch(onError);

        }).catch(onError);

        return this;

    }

    saveTo(outputFilePath: string){

        return new Promise((resolve, reject) => {

            this.fetchPage().then(response => {

                fs.writeFileSync(outputFilePath, response.data);

                resolve(response.data);

            }).catch(e => reject(e));

        });

    }

    async fetchPage(url: URL | null = null){

        if(url === null)
            url = this.#config.url || null;

        if(url === null)
            return Promise.reject(`Invalid URL: ${url}`);

        return await axios.get(url.toString(), {
            headers: this.#header.set("Cookie", this.cookie.export()).export(),
            timeout: this.#config.timeout,
            auth: this.#config.auth,
            ...this.#config.axiosOptions
        });

    }

    callCapture(){
        for(let callback of this.#captureListeners){
            if(typeof callback === "function")
                callback(this.#results);
        }
        return this;
    }

    capture(callback: (results: ScraperResultType) => void){
        this.#captureListeners.push(callback);
        return this;
    }

    addScraper(scraperName: string, scraperCallback: ScraperCallableType){
        if(!Array.isArray(this.#scrapers[scraperName]))
            this.#scrapers[scraperName] = [];
        this.#scrapers[scraperName].push(scraperCallback);
        return this;
    }

    addBrowserScraper(scraperName: string, scraperCallback: BrowserScraperCallableType){
        if(!Array.isArray(this.#browserScrapers[scraperName]))
            this.#browserScrapers[scraperName] = [];
        this.#browserScrapers[scraperName].push(scraperCallback);
        return this;
    }

    attachScraper(scraper: ScraperInfoType): this{
        const { name, run, type, description, urlFormat } = scraper;
        if(typeof run !== "function")
            throw new Error("Scraper doesn't have a valid runner, add 'run' element to your scraper returned object.");
        if(!type || !["headless", "browser", "both"].includes(type))
            throw new Error("Scraper type must be either 'headless' or 'browser', or set it to 'both' if you are unsure.");
        // noinspection SuspiciousTypeOfGuard
        if(typeof name !== "string" || !name.trim())
            throw new Error("Scraper doesn't have a proper name, set a value inside 'name' element in your scraper returned object.");
        run(this);
        return this;
    }

    dump(){
        console.log(this.results);
        return this;
    }

    reset(terminate: boolean = true){
        if(terminate)
            this.terminate();
        // noinspection DuplicatedCode
        this.#header = new ScraperHeaders();
        this.#cookie = new ScraperCookie();
        this.#scrapers = {};
        this.#browserScrapers = {};
        this.#results = new Map();
        this.#captureListeners = [];
        this.#config = this.DEFAULT_CONFIG;
        return this;
    }

    terminate(){
        this.#browser?.close();
        this.#browser = null;
        this.#browserType = SCRAPER_BROWSER.NONE;
        return this;
    }

    static createHeader(): ScraperHeaders{
        return new ScraperHeaders();
    }

    static createCookie(): ScraperCookie{
        return new ScraperCookie();
    }

    createHeader(): ScraperHeaders{
        return ScraperEngine.createHeader();
    }

    createCookie(): ScraperCookie{
        return ScraperEngine.createCookie();
    }

    get results(): ScraperResultType{
        return this.#results;
    }

    get header(){
        return this.#header;
    }

    get cookie(){
        return this.#cookie;
    }

}