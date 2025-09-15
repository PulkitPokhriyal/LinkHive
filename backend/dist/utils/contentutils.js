var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { tagModel, typeModel } from "../db.js";
import metascraper from "metascraper";
import metascraperImage from "metascraper-image";
import got from "got";
const scraper = metascraper([metascraperImage()]);
export function getCreateTags(tags) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(tags.map((tagName) => __awaiter(this, void 0, void 0, function* () {
            let tag = yield tagModel.findOne({ tags: tagName });
            if (!tag) {
                tag = yield tagModel.create({ tags: tagName });
            }
            return tag._id;
        })));
    });
}
export function getCreateType(typeName) {
    return __awaiter(this, void 0, void 0, function* () {
        let type = yield typeModel.findOne({ type: typeName });
        if (!type) {
            type = yield typeModel.create({ type: typeName });
        }
        return type._id;
    });
}
export function extractImageIframe(link) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            let videoId;
            if (link.includes("youtube.com")) {
                videoId = (_a = link.split("v=")[1]) === null || _a === void 0 ? void 0 : _a.split("&")[0];
            }
            else if (link.includes("youtu.be")) {
                videoId = (_b = link.split("youtu.be/")[1]) === null || _b === void 0 ? void 0 : _b.split("?")[0];
            }
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        }
        try {
            const { body: html } = yield got(link, {
                headers: {
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
                },
            });
            const metadata = yield scraper({ html, url: link });
            return metadata.image || "";
        }
        catch (error) {
            console.error("MetaScraper error:", error);
            return "";
        }
    });
}
