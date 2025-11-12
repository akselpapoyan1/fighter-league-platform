export interface Event {
  title: string;
  status: "upcoming" | "completed" | "live";
  event_date: string;
  location: string;
  division: string;
  id: number;
}
