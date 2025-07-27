import { tagModel, typeModel } from "../db.ts";
import metascraper from "metascraper";
import metascraperImage from "metascraper-image";
import got from "got";

const scraper = metascraper([metascraperImage()]);

export async function getCreateTags(tags: string[]) {
  return Promise.all(
    tags.map(async (tagName: string) => {
      let tag = await tagModel.findOne({ tags: tagName });
      if (!tag) {
        tag = await tagModel.create({ tags: tagName });
      }
      return tag._id;
    }),
  );
}

export async function getCreateType(typeName: string) {
  let type = await typeModel.findOne({ type: typeName });
  if (!type) {
    type = await typeModel.create({ type: typeName });
  }
  return type._id;
}

export async function extractImageIframe(link: string): Promise<string> {
  if (link.includes("youtube.com") || link.includes("youtu.be")) {
    const videoId = link.split("v=")[1]?.split("&")[0] || link.split("/").pop();
    if (videoId) {
      return `<iframe width="288" height="192" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    return "";
  }

  try {
    const { body: html } = await got(link, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
      },
    });
    const metadata = await scraper({ html, url: link });
    return metadata.image || "";
  } catch (error) {
    console.error("MetaScraper error:", error);
    return "";
  }
}
