import { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Division } from "@/types/fighter";

const Divisions = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDivisions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Division[]>("/divisions");
        setDivisions(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load divisions.");
      } finally {
        setLoading(false);
      }
    };
    fetchDivisions();
  }, []);

  const maleDivisions = divisions.filter((d) => d.gender === "male");
  const femaleDivisions = divisions.filter((d) => d.gender === "female");

  const DivisionCard = ({ division }: { division: Division }) => (
    <Card className="p-6 bg-gradient-stripe hover:shadow-gold transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-bold">{division.name}</h3>
        <Badge className="bg-primary text-primary-foreground">
          {division.gender === "male" ? "Men" : "Women"}
        </Badge>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Weight Range</p>
          <p className="text-xl font-semibold text-primary">
            {division.minWeight > 0 ? `${division.minWeight} - ` : "≤ "}
            {division.maxWeight} lbs
          </p>
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Description</p>
          <p className="text-sm">
            {division.gender === "male" ? "Male" : "Female"} fighters competing
            in the {division.name.toLowerCase()} category. This division
            showcases elite athletes with exceptional skill and determination.
          </p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Loading Divisions...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-gradient-stripe border-b border-border">
          <div className="container">
            <h1 className="text-5xl font-bold mb-4">
              Weight <span className="text-primary">Divisions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore our structured weight classes for male and female fighters
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="all">
                  All Divisions ({divisions.length})
                </TabsTrigger>
                <TabsTrigger value="male">
                  Men's Divisions ({maleDivisions.length})
                </TabsTrigger>
                <TabsTrigger value="female">
                  Women's Divisions ({femaleDivisions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {divisions.map((division) => (
                    <DivisionCard key={division.id} division={division} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="male">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {maleDivisions.map((division) => (
                    <DivisionCard key={division.id} division={division} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="female">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {femaleDivisions.map((division) => (
                    <DivisionCard key={division.id} division={division} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-16 bg-card border-t border-border">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">About Our Divisions</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Our weight division system ensures fair and competitive matchups
                across all categories. Fighters are matched based on their
                weight class, gender, and skill level to create the most
                exciting and equitable competitions.
              </p>
              <p>
                Each division follows strict weight limits and verification
                procedures. Fighters must weigh in within their designated
                weight range to compete in official matches.
              </p>
              <p>
                The division system allows fighters to compete nationally,
                regionally, and globally within their weight class, creating
                clear pathways to championship opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Divisions;
