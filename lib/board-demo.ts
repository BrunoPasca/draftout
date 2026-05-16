export type PlayerId = "a" | "b";

export type BoardGoal = {
  id: number;
  label: string;
};

export const BOARD_GOALS: BoardGoal[] = [
  { id: 0, label: "Stone pick" },
  { id: 1, label: "Iron ingot" },
  { id: 2, label: "Lava bucket" },
  { id: 3, label: "Wheat farm" },
  { id: 4, label: "Bed" },
  { id: 5, label: "Zombie kill" },
  { id: 6, label: "Diamond" },
  { id: 7, label: "Enchant table" },
  { id: 8, label: "Village" },
  { id: 9, label: "Boat" },
  { id: 10, label: "Nether portal" },
  { id: 11, label: "Blaze rod" },
  { id: 12, label: "Brew potion" },
  { id: 13, label: "Ender pearl" },
  { id: 14, label: "Stronghold" },
  { id: 15, label: "Golden apple" },
  { id: 16, label: "Tame wolf" },
  { id: 17, label: "Ocean monument" },
  { id: 18, label: "Map" },
  { id: 19, label: "Anvil" },
  { id: 20, label: "Beacon" },
  { id: 21, label: "Elytra" },
  { id: 22, label: "Dragon egg" },
  { id: 23, label: "Shulker box" },
  { id: 24, label: "Totem" },
];

/** Scripted claim order for the landing demo */
export const DEMO_CLAIMS: { index: number; player: PlayerId }[] = [
  { index: 0, player: "a" },
  { index: 5, player: "b" },
  { index: 6, player: "a" },
  { index: 10, player: "b" },
  { index: 2, player: "a" },
  { index: 11, player: "b" },
  { index: 16, player: "a" },
  { index: 1, player: "b" },
  { index: 12, player: "a" },
  { index: 7, player: "b" },
  { index: 3, player: "a" },
  { index: 14, player: "b" },
  { index: 8, player: "a" },
];

export const WIN_TARGET = 13;
