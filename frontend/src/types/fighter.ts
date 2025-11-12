export interface Fighter {
  id: string;
  name: string;
  country: string;
  division: string;
  weight: number;
  gender: "male" | "female";
  record: string;
  wins: number;
  losses: number;
  draws: number;
  image: string;
  ranking?: number;
  bio?: string;
  achievements?: string[];
  sponsors?: Sponsor[];
  walletAddress: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "fighter" | "division" | "national" | "regional" | "global";
  logo?: string;
}

export interface Division {
  id: string;
  name: string;
  gender: "male" | "female";
  minWeight: number;
  maxWeight: number;
}

export const DIVISIONS: Division[] = [
  {
    id: "men-light",
    name: "Lightweight",
    gender: "male",
    minWeight: 0,
    maxWeight: 165,
  },
  {
    id: "men-welter",
    name: "Welterweight",
    gender: "male",
    minWeight: 165,
    maxWeight: 190,
  },
  {
    id: "men-light-heavy",
    name: "Light Heavyweight",
    gender: "male",
    minWeight: 190,
    maxWeight: 215,
  },
  {
    id: "men-heavy",
    name: "Heavyweight",
    gender: "male",
    minWeight: 215,
    maxWeight: 285,
  },

  {
    id: "women-fly",
    name: "Flyweight",
    gender: "female",
    minWeight: 0,
    maxWeight: 125,
  },
  {
    id: "women-bantam",
    name: "Bantamweight",
    gender: "female",
    minWeight: 125,
    maxWeight: 145,
  },
  {
    id: "women-open",
    name: "Open/Heavyweight",
    gender: "female",
    minWeight: 145,
    maxWeight: 185,
  },
];
