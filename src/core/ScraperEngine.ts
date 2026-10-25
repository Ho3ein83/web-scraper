import axios from "axios";
import fs from "fs";

import ScraperHeaders from "./ScraperHeaders";
import ScraperCookie from "./ScraperCookie";
import { BrowserScraperCallableType, SCRAPER_BROWSER, ScraperCallableType, ScraperEngineBrowserConfigType, ScraperEngineConfigType, ScraperInfoSummaryType, ScraperInfoType, ScraperResultType } from "./types";
import { CheerioAPI, load } from "cheerio";
import type { Browser, Page } from "playwright";
type PlaywrightModule = typeof import("playwright");

let playwrightPromise: Promise<PlaywrightModule> | undefined;

async function loadPlaywright(): Promise<PlaywrightModule> {
    playwrightPromise ??= import("playwright").catch((err: any) => {
        playwrightPromise = undefined; // allow retry after the user installs it
        if (err?.code === "ERR_MODULE_NOT_FOUND" || err?.code === "MODULE_NOT_FOUND") {
            throw new Error(
                'Playwright is required for browser scraping but is not installed. ' +
                'Run "npm i playwright" and then "npx playwright install".'
            );
        }
        throw err;
    });
    return playwrightPromise;
}

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

    #onHtmlLoad: ((html: string) => string|null)|null = null;

    #currentPage: Page | null = null;

    #scrapersInfo: { [name: string]: ScraperInfoSummaryType } = {};

    readonly DEFAULT_CONFIG: ScraperEngineConfigType = {
        url: null,
        timeout: 10000,
        loadImages: false,
        browser: {
            waitUntil: "domcontentloaded"
        }
    };

    constructor(config: ScraperEngineConfigType = {}){

        this.#config = Object.assign(this.DEFAULT_CONFIG, config);

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

        if(typeof this.#onHtmlLoad === "function") {
            const response = this.#onHtmlLoad(html);
            if(typeof response !== "string")
                return Promise.reject("Result captured without returning any HTML");
            html = response;
        }

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

        const { chromium, firefox } = await loadPlaywright();

        if(browserId === SCRAPER_BROWSER.CHROMIUM) {
            if(this.#browser && this.#browserType !== SCRAPER_BROWSER.CHROMIUM)
                this.terminate();
            this.log("Launching Chromium...");
            this.#browser = await chromium.launch({ timeout: this.#config.browser?.timeout || undefined });
        }
        else if(browserId === SCRAPER_BROWSER.FIREFOX) {
            if(this.#browser && this.#browserType !== SCRAPER_BROWSER.FIREFOX)
                this.terminate();
            this.log("Launching Firefox...");
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

        this.log("Opening requested page...");
        this.#currentPage = await this.#browser.newPage();

        if(!this.#config.loadImages){
            await this.#currentPage.route("**/*", route => {
                if(route.request().resourceType() === "image")
                    return route.abort();
                return route.continue();
            });
            this.log("Image preview is disabled, webpage images won't get downloaded unless you set 'loadImages' to 'true' in engine config");
        }

        await this.#currentPage.goto(
            url,
            { waitUntil: this.#config.browser?.waitUntil || "domcontentloaded" }
        );

        for(let scraper of Object.entries(this.#browserScrapers)){
            const [name, callbacks] = scraper;
            let lastValue = undefined;
            for(const callback of callbacks)
                lastValue = await callback(this.#currentPage, lastValue);
            this.#results.set(name, lastValue);
        }

        await this.#currentPage.close();

        this.#currentPage = null;

        this.callCapture();

    }

    async scrapeNewPage(url: string, callback: BrowserScraperCallableType, config: ScraperEngineBrowserConfigType | null = null){

        if(!this.#browser)
            return Promise.reject("The browser is not initialized yet or it's been closed, try running 'scrapeNewPage' method inside your scraper callback added using 'addBrowserScraper' method");

        if(!this.#currentPage || this.#currentPage.isClosed())
            return Promise.reject("Current page is not initialized yet or it's been closed. Use 'scrapeNewPage' method only inside browser scraper which you've added using 'addBrowserScraper' method.");

        const newPage = await this.#browser.newPage();

        await newPage.goto(url, { waitUntil: config?.waitUntil || this.#config.browser?.waitUntil || "domcontentloaded" });

        const results = await callback(newPage, undefined);

        await newPage.close();

        return results;

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
        const { name, run, type, ...rest } = scraper;
        if(typeof run !== "function")
            throw new Error("Scraper doesn't have a valid runner, add 'run' element to your scraper returned object.");
        if(!type || !["headless", "browser", "both"].includes(type))
            throw new Error("Scraper type must be either 'headless' or 'browser', or set it to 'both' if you are unsure.");
        // noinspection SuspiciousTypeOfGuard
        if(typeof name !== "string" || !name.trim())
            throw new Error("Scraper doesn't have a proper name, set a value inside 'name' element in your scraper returned object.");
        this.#scrapersInfo[name] = { type, ...rest };
        run(this);
        return this;
    }

    dump(){
        console.log(this.results);
        return this;
    }

    exportJson(filePath: string){
        fs.writeFileSync(filePath, JSON.stringify(Object.fromEntries(this.results)));
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

    onHtmlLoad(callback: ((html: string) => null|string)){
        if(typeof callback === "function")
            this.#onHtmlLoad = callback;
        return this;
    }

    async promiseAllWithProgress<T = unknown>(promises: Promise<unknown>[], chunkSize: number = 3, onProgress: null | ((completed: number, total: number) => void) = null): Promise<T[]> {
        const results: T[] = [];
        const total = promises.length;
        let completed = 0;

        for (let i = 0; i < total; i += chunkSize) {
            const chunk = promises.slice(i, i + chunkSize);
            const chunkResults = await Promise.all(chunk);

            results.push(...chunkResults as T[]);
            completed += chunk.length;

            onProgress?.(completed, total);
        }

        return results;
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

    log(text: unknown){
        console.log(text);
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