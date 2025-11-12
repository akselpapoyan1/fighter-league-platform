import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FighterCard } from "@/components/FighterCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import apiClient from "../api/apiClient";
import { Division, Fighter } from "@/types/fighter";

const Fighters = () => {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fightersRes, divisionsRes] = await Promise.all([
          apiClient.get<Fighter[]>("/fighters"),
          apiClient.get<Division[]>("/divisions"),
        ]);

        setFighters(fightersRes.data);
        setDivisions(divisionsRes.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFighters = fighters.filter((fighter: Fighter) => {
    const matchesSearch =
      fighter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fighter.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDivision =
      selectedDivision === "all" || fighter.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });

  const maleFighters = filteredFighters.filter((f) => f.gender === "male");
  const femaleFighters = filteredFighters.filter((f) => f.gender === "female");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-gradient-stripe border-b border-border">
          <div className="container">
            <h1 className="text-5xl font-bold mb-4">
              All <span className="text-primary">Fighters</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse fighters from around the world across all divisions
            </p>
          </div>
        </section>

        <section className="py-8 bg-card border-b border-border sticky top-16 z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fighters or countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedDivision}
                onValueChange={setSelectedDivision}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.name}>
                      {division.name} ({division.gender === "male" ? "M" : "F"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
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
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-8 ">
                  <TabsTrigger value="all">
                    All Fighters ({filteredFighters.length})
                  </TabsTrigger>
                  <TabsTrigger value="male">
                    Men ({maleFighters.length})
                  </TabsTrigger>
                  <TabsTrigger value="female">
                    Women ({femaleFighters.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {filteredFighters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredFighters.map((fighter) => (
                        <FighterCard key={fighter.id} {...fighter} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-muted-foreground">
                        No fighters found matching your criteria.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="male">
                  {maleFighters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {maleFighters.map((fighter) => (
                        <FighterCard key={fighter.id} {...fighter} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-muted-foreground">
                        No male fighters found matching your criteria.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="female">
                  {femaleFighters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {femaleFighters.map((fighter) => (
                        <FighterCard key={fighter.id} {...fighter} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-muted-foreground">
                        No female fighters found matching your criteria.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Fighters;
