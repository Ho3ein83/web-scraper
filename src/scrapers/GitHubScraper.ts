import { ScraperInfoType } from "../core/types";
import ScraperEngine from "../core/ScraperEngine";
import { CheerioAPI } from "cheerio/dist/commonjs/load";

const GitHubScraper: ScraperInfoType = {
    name: "GitHub",
    type: "headless",
    run: (engine: ScraperEngine) => {

        engine.addScraper("meta", ($: CheerioAPI) => {
            let meta: { [key: string]: any } = {};
            const json = $.extract({ data: 'script[data-target="react-app.embeddedData"]' });
            if(json) {
                try {
                    const data = JSON.parse(json.data ?? "");
                    meta.about = data.payload.sidebarAbout.description ?? "";
                    meta.author = data.payload.sidebarAbout.ownerLogin ?? "";
                    meta.repo_name = data.payload.sidebarAbout.repoName ?? "";
                    meta.website = data.payload.sidebarAbout.website ?? "";
                    meta.forks = data.payload.sidebarAbout.forksCount ?? "";
                    meta.watchers = data.payload.sidebarAbout.watcherCount ?? "";
                    meta.stars = data.payload.sidebarAbout.stargazerCount ?? "";
                } catch (e){
                    console.log(e);
                }
            }
            return meta;
        });

        engine.addScraper("readme", ($) => {
            const json = $.extract({ data: 'script[data-target="react-app.embeddedData"]' });
            if(json) {
                try {
                    const data = JSON.parse(json.data ?? "");
                    const files = data.payload.codeViewRepoRoute.overview.overviewFiles;
                    if(Array.isArray(files)) {
                        for(let file of files){
                            if(file.preferredFileType === "readme") {
                                return {
                                    name: file.displayName,
                                    content: file.richText
                                }
                            }
                        }
                    }
                } catch (e){
                    console.log(e);
                }
            }
        });

    },
    description: "Extract basic information of a GitHub repository",
    urlFormat: /^https:\/\/github.com\/.*/
};

export default GitHubScraper;