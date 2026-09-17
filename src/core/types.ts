import { AxiosBasicCredentials, AxiosRequestConfig, AxiosResponse } from "axios";
import { CheerioAPI } from "cheerio";
import ScraperEngine from "./ScraperEngine";
import { Page } from "playwright";

export type ScraperRequestResponseType = AxiosResponse;

export type ScraperCallableType = ($: CheerioAPI, previousValue: any | undefined) => any;

export type BrowserScraperCallableType = (page: Page, previousValue: any | undefined) => any;

export type ScraperResultType = Map<string, any>;

export enum SCRAPER_BROWSER {
    CHROMIUM, FIREFOX, NONE
}

export type ScraperInfoType = {
    name: string,
    run: (engine: ScraperEngine) => any,
    type?: "browser" | "headless" | "both",
    description?: string,
    urlFormat?: RegExp,
};

export type ScraperEngineConfigType = {
    url?: URL | null,
    timeout?: 10000,
    auth?: AxiosBasicCredentials | undefined,
    axiosOptions?: AxiosRequestConfig | undefined,
    browser?: {
        waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit"
    }
}