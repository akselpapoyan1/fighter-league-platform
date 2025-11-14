// export interface Division {
//   id: string;
//   name: string;
//   gender: "male" | "female";
//   min_weight: number;
//   max_weight: number;
// }
//
// export const DIVISIONS: Division[] = [
//   {
//     id: "men-light",
//     name: "Lightweight",
//     gender: "male",
//     min_weight: 0,
//     max_weight: 165,
//   },
//   {
//     id: "men-welter",
//     name: "Welterweight",
//     gender: "male",
//     min_weight: 165,
//     max_weight: 190,
//   },
//   {
//     id: "men-light-heavy",
//     name: "Light Heavyweight",
//     gender: "male",
//     min_weight: 190,
//     max_weight: 215,
//   },
//   {
//     id: "men-heavy",
//     name: "Heavyweight",
//     gender: "male",
//     min_weight: 215,
//     max_weight: 285,
//   },
//
//   {
//     id: "women-fly",
//     name: "Flyweight",
//     gender: "female",
//     min_weight: 0,
//     max_weight: 125,
//   },
//   {
//     id: "women-bantam",
//     name: "Bantamweight",
//     gender: "female",
//     min_weight: 125,
//     max_weight: 145,
//   },
//   {
//     id: "women-open",
//     name: "Open/Heavyweight",
//     gender: "female",
//     min_weight: 145,
//     max_weight: 185,
//   },
// ];
//
// export const getDivisionFromWeight = (
//   weight: number,
//   gender: "male" | "female"
// ): string | null => {
//   const division = DIVISIONS.find((d) => {
//     if (d.gender !== gender) return false;
//
//     if (d.min_weight === 0) {
//       return weight > d.min_weight && weight <= d.max_weight;
//     }
//
//     return weight > d.min_weight && weight <= d.max_weight;
//   });
//
//   return division ? division.name : null;
// };
