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

export const getDivisionFromWeight = (
  weight: number,
  gender: "male" | "female"
): string | null => {
  const division = DIVISIONS.find((d) => {
    if (d.gender !== gender) return false;

    if (d.minWeight === 0) {
      return weight > d.minWeight && weight <= d.maxWeight;
    }

    return weight > d.minWeight && weight <= d.maxWeight;
  });

  return division ? division.name : null;
};
