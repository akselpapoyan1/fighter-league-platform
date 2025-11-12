import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Award } from "lucide-react";
import { Fighter } from "@/types/fighter";

const FighterProfile = () => {
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_IMAGE_URL as string;

  const { id } = useParams();

  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchFighter = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Fighter>(`/fighters/${id}`);
        setFighter(response.data);
      } catch (err) {
        console.error(err);
        setError("Fighter not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchFighter();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Loading Fighter...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !fighter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {error ? "An Error Occurred" : "Fighter Not Found"}
            </h1>
            {error && <p className="text-muted-foreground mb-4">{error}</p>}
            <Link to="/fighters">
              <Button>Back to Fighters</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-6 bg-card border-b border-border">
          <div className="container">
            <Link to="/fighters">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Fighters
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-12 bg-gradient-stripe">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 overflow-hidden rounded-lg shadow-strong">
                <img
                  src={
                    fighter.image === "https://i.imgur.com/LpaY82x.png"
                      ? fighter.image
                      : supabaseAnonKey + fighter.image
                  }
                  alt={fighter.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                {fighter.ranking && (
                  <Badge className="bg-primary text-primary-foreground mb-4 text-lg px-4 py-1">
                    Rank #{fighter.ranking}
                  </Badge>
                )}
                <h1 className="text-5xl font-bold mb-4">{fighter.name}</h1>
                <p className="text-2xl text-muted-foreground mb-8">
                  {fighter.country}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <Card className="p-6 bg-card/50">
                    <p className="text-muted-foreground mb-2">Division</p>
                    <p className="text-2xl font-bold">{fighter.division}</p>
                  </Card>
                  <Card className="p-6 bg-card/50">
                    <p className="text-muted-foreground mb-2">Weight</p>
                    <p className="text-2xl font-bold">{fighter.weight} lbs</p>
                  </Card>
                  <Card className="p-6 bg-card/50">
                    <p className="text-muted-foreground mb-2">Record</p>
                    <p className="text-2xl font-bold text-primary">
                      {fighter.record}
                    </p>
                  </Card>
                  <Card className="p-6 bg-card/50">
                    <p className="text-muted-foreground mb-2">Win Rate</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(
                        (fighter.wins /
                          (fighter.wins + fighter.losses + fighter.draws)) *
                          100
                      )}
                      %
                    </p>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-gold hover:opacity-90 transition-opacity"
                  >
                    Sponsor This Fighter
                  </Button>
                  <Button size="lg" variant="outline">
                    View Fight History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {fighter.bio && (
          <section className="py-12 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-3xl font-bold mb-6">Biography</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {fighter.bio}
              </p>
            </div>
          </section>
        )}

        {fighter.achievements && fighter.achievements.length > 0 && (
          <section className="py-12">
            <div className="container max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Achievements</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fighter.achievements.map((achievement, index) => (
                  <Card
                    key={index}
                    className="p-4 flex items-center gap-3 bg-card/50"
                  >
                    <Award className="h-6 w-6 text-primary flex-shrink-0" />
                    <p className="font-medium">{achievement}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {fighter.sponsors && fighter.sponsors.length > 0 && (
          <section className="py-12 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-3xl font-bold mb-6">Sponsors</h2>
              <div className="flex flex-wrap gap-4">
                {fighter.sponsors.map((sponsor) => (
                  <Badge
                    key={sponsor.id}
                    variant="outline"
                    className="text-lg px-4 py-2"
                  >
                    {sponsor.name} • {sponsor.tier}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FighterProfile;
