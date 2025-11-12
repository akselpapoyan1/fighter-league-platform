import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/apiClient";
import { Fighter } from "@/types/fighter";
import { useToast } from "@/hooks/use-toast";
import { Award, BarChart, Edit, MapPin, Weight } from "lucide-react";
import { Link } from "react-router-dom";

const SUPABASE_IMAGE_URL =
  "https://eumlexrcxqgaudtsmavc.supabase.co/storage/v1/object/public/fighter-images/";

const FighterDashboard = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await apiClient.get<Fighter>("/fighters/me");
        setFighter(response.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description:
            error.response?.data?.message || "Could not fetch your data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyProfile();
    }
  }, [token, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading your profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find a fighter profile linked to your account.
            </p>
            <Button asChild>
              <Link to="/register">Register as a Fighter</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const StatItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/20">
        <div className="container max-w-4xl">
          <Card className="mb-6 overflow-hidden">
            <div className="relative h-48 w-full bg-gradient-stripe">
              <img
                src={`${SUPABASE_IMAGE_URL}${fighter.image}`}
                alt={fighter.name}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full border-4 border-background shadow-lg object-cover"
              />
            </div>
            <div className="text-center p-6 pt-20">
              <h1 className="text-4xl font-bold">{fighter.name}</h1>
              <p className="text-2xl text-primary font-semibold">
                {fighter.record}
              </p>
              <p className="text-lg text-muted-foreground">
                {fighter.division}
              </p>
            </div>
            <div className="border-t p-4 flex justify-end">
              <Button variant="outline" asChild>
                <Link to="/dashboard/fighter/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatItem
                  icon={<MapPin />}
                  label="Country"
                  value={fighter.country}
                />
                <StatItem
                  icon={<BarChart />}
                  label="Gender"
                  value={
                    fighter.gender.charAt(0).toUpperCase() +
                    fighter.gender.slice(1)
                  }
                />
                <StatItem
                  icon={<Weight />}
                  label="Weight"
                  value={`${fighter.weight} lbs`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {fighter.achievements && fighter.achievements.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2">
                    {fighter.achievements.map((ach, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        {ach}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No achievements listed yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FighterDashboard;
