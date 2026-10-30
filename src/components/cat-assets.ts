export const catNames = ["Tundra", "Maple"];

export type CatTrick = { kind: "meow" | "pspsps"; id: number };

export const sticker = (cat: number, pose: number) => `/images/cats/${catNames[cat]}${pose}.png`;
