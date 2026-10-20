export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const youtubeUrl =
  process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Tueresmigasolina";
export const whatsappChannelUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL ??
  "https://whatsapp.com/channel/0029VbECTyCGJP8BlsvjVk2m";

export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
