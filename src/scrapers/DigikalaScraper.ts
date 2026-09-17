import { ScraperInfoType } from "../core/types";
import { Page } from "playwright";

const DigikalaScraper: ScraperInfoType = {
    name: "Digikala",
    description: "Digikala basic product information extract",
    type: "browser",
    run: engine => {

        function fa2en(str: string) {
            const numbers: { [faOrAr: string]: string } = {
                '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
                '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
                '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
                '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
            };
            return str.replace(/[۰-۹٠-٩]/g, match => numbers[match]);
        }

        engine.addBrowserScraper("product", async (page: Page) => {

            const result: { [key: string]: any } = {};

            const mainImageSection = page.locator("[data-main-image-src]").first();
            result.main_image = await mainImageSection.getAttribute("data-main-image-src");

            result.title = await page.getByTestId("pdp-title").first()
                                     .innerText();

            result.price_formatted = await page.getByTestId("buy-box")
                                               .getByTestId("price-final").first()
                                               .innerText();
            result.price_formatted_en = fa2en(result.price_formatted);
            result.price = Number(result.price_formatted_en.replace(/[^0-9]/g, ""));

            const ratingSibling = page.locator("#pdp-variant")
                                      .getByAltText("امتیاز").first()
                                      .locator("xpath=../../..")
                                      .getByRole("paragraph");

            result.rating = Number(fa2en(await ratingSibling.first().innerText()));
            result.rating_label = fa2en(await ratingSibling.last().innerText());
            result.rating_count = result.rating_label.replace(/[^0-9]/g, "");

            result.gallery = [];
            const gallery = await mainImageSection.getByRole("img", { includeHidden: true }).all();
            for (const el of gallery) {
                const src = await el.getAttribute("src");
                if(src)
                    result.gallery.push(src);
            }

            return result;

        });

    },
    urlFormat: /×https:\/\/www.digikala.com\/product\/.*/
};

export default DigikalaScraper;