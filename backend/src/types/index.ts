export interface Sponsor {
  id: string;
  name: string;
  tier: string;
}

export interface Fighter {
  id: number;
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
}

export interface Division {
  id: string;
  name: string;
  gender: "male" | "female";
  min_weight: number;
  max_weight: number;
}

export interface Event {
  id: number;
  title: string;
  event_date: string;
  location: string;
  division: string;
  status: "upcoming" | "completed" | "live";
}
