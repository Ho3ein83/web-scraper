import { ScraperInfoType } from "../core/types";
import { Page } from "playwright";
import ScraperEngine from "../core/ScraperEngine";

type TelewebionBasicInfoEntry = { id: string, title: string, url: string, poster_url: string | null };
type TelewebionCastEntry = { id: string, name: string, avatar: string | null };
type TelewebionCrewEntry = { id: string, name: string };
type TelewebionTitleEntry = {
    id: string,
    title: string,
    url: string,
    poster_url: string | null
    description: string,
    runtime: string | null,
    backdrop: string | null,
    country: string | null,
    genres: string[],
    release_date: number | null,
    network: string | null,
    age_rating: string | null,
    cast: TelewebionCastEntry[],
    directors: TelewebionCrewEntry[],
    producers: TelewebionCrewEntry[],
    writers: TelewebionCrewEntry[],
    songWriters: TelewebionCrewEntry[],
    cinematographers: TelewebionCrewEntry[],
    editors: TelewebionCrewEntry[],
    seasons_count: number
}

type TelewebionBasicInfo = {
    [id: string]: TelewebionBasicInfoEntry
};

const telewebionDetailsScraper = async (card: TelewebionBasicInfoEntry, page: Page): Promise<TelewebionTitleEntry> => {

    // Header
    const backdropLocator = page.getByAltText(card.title);
    const backdrop = await backdropLocator.first().getAttribute("src");

    // Basics
    const sections = page.locator("#summary-row > div > div");
    const extractBasics = async (refText: string) => {
        const ref = sections.getByText(refText);
        if(ref && await ref.count() > 0) {
            const sibling = ref.locator("xpath=following-sibling::*[1]");
            if(await sibling.count())
                return await sibling.innerText();
        }
        return null;
    }
    const description = await sections.nth(1).locator("div > div").nth(1).innerHTML();
    const countryTags = sections.nth(2).locator('[data-gtm="product-country-tag"]');
    const country = await countryTags.count() > 0 ? await countryTags.innerText() : null;
    const genreTags = sections.nth(2).locator('[data-gtm="product-genres-tag"]');
    const genres = [];
    const releaseDate = parseInt(await extractBasics("تاریخ انتشار:") || "0") || null;
    const network = await extractBasics("ارائه شده توسط:");
    const ageRating = await extractBasics("رده سنی:");

    for(const tag of await genreTags.all())
        genres.push(await tag.innerText());

    // Movies
    const runtimeRef = sections.nth(2).getByText("مدت پخش:");
    const runtimeParent = await runtimeRef.count() > 0 ? runtimeRef.locator("..") : null;
    const runtime = runtimeParent ? await runtimeParent.innerText() : null;

    // Series
    const seasonsCount = await page.locator('[data-gtm="product-season"]').count();

    // Cast
    const castSection = page.locator('[data-gtm="product-casts-row"]');
    const castItems = castSection.locator('a[data-gtm="product-cast"]');
    const allCastItems = await castItems.all();
    const cast: TelewebionCastEntry[] = [];
    if(allCastItems.length > 0){
        for(const item of allCastItems){
            const _id = await item.getAttribute("data-id");
            if(!_id)
                continue;
            const _name = await item.locator("h3").first().innerText();
            const img = item.locator("img").first();
            const _avatar = await img.count() > 0 ? await img.getAttribute("src") : null;
            cast.push({ id: _id, name: _name, avatar: _avatar });
        }
    }

    // Credits
    const crewRow = page.locator('[data-gtm="product-crews-row"]');
    const extractCrew = async (refText: string) => {
        const ref = crewRow.getByText(refText).first();
        const parent = await ref.count() > 0 ? ref.locator("..") : null;
        const items: TelewebionCrewEntry[] = [];
        if(parent){
            const allItems = await parent.locator('[data-gtm="product-crew"]').all();
            if(allItems.length){
                for(const item of allItems){
                    const _id = await item.getAttribute("data-id");
                    if(!_id)
                        continue;
                    const _name = (await item.innerText()).trim();
                    items.push({ id: _id, name: _name });
                }
            }
        }
        return items;
    };

    const directors = await extractCrew("کارگردان:");
    const producers = await extractCrew("تهیه کننده:");
    const writers = await extractCrew("نویسنده:");
    const songWriters = await extractCrew("آهنگساز:");
    const cinematographers = await extractCrew("فیلم بردار:");
    const editors = await extractCrew("تدوینگر:");

    return {
        ...card,
        description, runtime, backdrop,
        country, genres, release_date: releaseDate, network, age_rating: ageRating,
        cast, directors, producers, writers, songWriters, cinematographers, editors,
        seasons_count: seasonsCount
    }

}

const TelewebionScraper: ScraperInfoType = {
    name: "Telewebion",
    description: "Telewebion movies and TV shows scraper",
    type: "browser",
    run: (engine: ScraperEngine) => {

        engine.addBrowserScraper("in_tv", async (page: Page) => {

            console.log('Scraping "In TV" section...');

            const titlesLimit = 10;

            const result: TelewebionBasicInfo = {};

            const cards = await page.locator('div[data-row-number="1"] > .tw-slider a[data-gtm="card"]').all();

            if(cards.length > 0){
                let counter = 0;
                for(const card of cards){
                    if(counter >= titlesLimit)
                        break;
                    const idPromise = card.getAttribute("data-id");
                    const titlePromise = card.getAttribute("data-title");
                    const posterPromise = card.locator("img").first().getAttribute("src");
                    const all = await Promise.all([idPromise, titlePromise, posterPromise]);
                    if(all[0]){
                        const _id = all[0];
                        const _title = all[1] || "";
                        const _poster_url = all[2];
                        result[_id] = {
                            id: _id,
                            title: _title,
                            url: "https://telewebion.net/product/" + _id,
                            poster_url: _poster_url
                        }
                    }
                    counter++;
                }
            }

            console.log(`Extracted ${cards.length} item${cards.length > 1 ? "s" : ""} from "In TV" section`);

            return result;

        });

        engine.addBrowserScraper("details", async (page: Page) => {

            const result: { [key: string]: TelewebionTitleEntry } = {};

            if(engine.results.has("in_tv")){
                engine.log('Extracting "In TV" titles information...');
                const cards: TelewebionBasicInfo = engine.results.get("in_tv");
                const promises = [];
                for(const card of Object.values(cards))
                    promises.push(engine.scrapeNewPage(card.url, async (p: Page) => await telewebionDetailsScraper(card, p)));
                engine.log(`Fetching ${promises.length} item${promises.length > 1 ? "s" : ""} from Telewebion...`);
                const results = await engine.promiseAllWithProgress<TelewebionTitleEntry>(
                    promises,
                    3,
                    (completed, total) => engine.log(`${completed}/${total} item${completed > 1 ? "s" : ""} completed`)
                )
                for(const r of results)
                    result[r.id] = r;
            }

            return result;

        });

    },
    urlFormat: /https:\/\/telewebion.net\/.*/,
};

export default TelewebionScraper;