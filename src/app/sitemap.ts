import type { MetadataRoute } from "next";
import { buildAbsoluteUrl, getIndexablePages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return getIndexablePages().map((page) => ({
    url: buildAbsoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
