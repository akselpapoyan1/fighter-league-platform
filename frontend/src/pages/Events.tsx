import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { Event } from "@/types/event";

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          apiClient.get<Event[]>("/events?status=upcoming"),
          apiClient.get<Event[]>("/events?status=completed"),
        ]);

        setUpcomingEvents(upcomingRes.data);
        setPastEvents(pastRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="p-6 bg-gradient-stripe hover:shadow-gold transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
          <Badge
            className={
              event.status === "upcoming"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }
          >
            {event.status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(event.event_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{event.division}</span>
        </div>
      </div>

      {event.status === "upcoming" && (
        <Button className="w-full mt-6 bg-gradient-gold hover:opacity-90 transition-opacity">
          View Event Details
        </Button>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-gradient-stripe border-b border-border">
          <div className="container">
            <h1 className="text-5xl font-bold mb-4">
              Fight <span className="text-primary">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Upcoming championships and competition schedules
            </p>
          </div>
        </section>

        {loading && (
          <section className="py-12">
            <div className="container flex justify-center items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xl text-muted-foreground">Loading Events...</p>
            </div>
          </section>
        )}

        {error && (
          <section className="py-12">
            <div className="container text-center">
              <p className="text-xl text-destructive">{error}</p>
            </div>
          </section>
        )}

        {!loading && !error && upcomingEvents.length > 0 && (
          <section className="py-12">
            <div className="container">
              <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && pastEvents.length > 0 && (
          <section className="py-12 bg-card">
            <div className="container">
              <h2 className="text-3xl font-bold mb-8">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 border-t border-border">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">
              Want to Attend or Compete?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Stay updated on all our events and be part of the valor Fighting
              community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-gold hover:opacity-90 transition-opacity"
              >
                Register as Fighter
              </Button>
              <Button size="lg" variant="outline">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
