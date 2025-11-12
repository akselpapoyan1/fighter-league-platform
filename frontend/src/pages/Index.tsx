import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FighterCard } from "@/components/FighterCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Trophy, Users, Globe, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-fighters.jpg";
import apiClient from "@/api/apiClient";
import { Fighter } from "@/types/fighter";
import FighterGlobe from "@/components/FighterGlobe";

const Index = () => {
  const [featuredFighters, setFeaturedFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFeaturedFighters = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Fighter[]>("/fighters", {
          params: {
            sortBy: "ranking",
            limit: 4,
          },
        });
        setFeaturedFighters(
          response.data.sort((a, b) => b.ranking - a.ranking)
        );
      } catch (err) {
        setError("Failed to fetch fighters. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFighters();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-stripe opacity-30" />
          </div>
          <div className="container relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Global Warriors <span className="text-primary">Rise</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                Every Nation. Every Challenge. One Ring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-gold hover:opacity-90 transition-opacity text-lg px-8"
                  >
                    Register as Fighter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/fighters">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    View All Fighters
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-border">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-primary mb-2">150+</h3>
                <p className="text-muted-foreground">Countries Represented</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-primary mb-2">2,500+</h3>
                <p className="text-muted-foreground">Active Fighters</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-primary mb-2">48</h3>
                <p className="text-muted-foreground">Championship Events</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-stripe">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Top Ranked Fighters</h2>
              <p className="text-xl text-muted-foreground">
                Meet the elite warriors competing for glory
              </p>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-xl text-muted-foreground">
                  Loading Fighters...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-xl text-destructive">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {featuredFighters.slice(0, 4).map((fighter) => (
                    <FighterCard key={fighter.id} {...fighter} />
                  ))}
                </div>

                <div className="text-center">
                  <Link to="/fighters">
                    <Button
                      size="lg"
                      className="bg-gradient-gold hover:opacity-90 transition-opacity"
                    >
                      View All Fighters
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20">
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Where the World's Warriors Unite
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose a country and witness its champions rise in the Fighter
                League arena.
              </p>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-xl text-muted-foreground">Loading Map...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-xl text-destructive">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-8 overflow-x-hidden">
                  <FighterGlobe />
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-20 bg-card">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Stay Updated with the Latest Fights
              </h2>
              <p className="text-muted-foreground mb-8">
                Get exclusive access to fight announcements, results, and
                behind-the-scenes content
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="bg-gradient-gold hover:opacity-90 transition-opacity">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
