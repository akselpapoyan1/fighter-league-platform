/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import { ShieldCheck, Loader2, LinkIcon, Mail, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SponsorProfile {
  company_name: string;
  website: string;
  logo_url: string;
  contact_email: string;
  description: string;
  tier: "Gold" | "Silver" | "Bronze" | "Partner";
}

const SponsorDashboard = () => {
  const SUPABASE_IMAGE_URL =
    "https://eumlexrcxqgaudtsmavc.supabase.co/storage/v1/object/public/sponsor-logos/";
  const { userType } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    if (userType !== "SPONSOR") {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/dashboard/sponsor/me");
        setProfileData(response.data);
        setProfileExists(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setProfileExists(false);
        } else {
          toast({
            title: "Error fetching profile",
            description:
              error.response?.data?.message || "Could not load sponsor data.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userType, toast]);

  if (userType !== "SPONSOR") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p>You must be logged in as a Sponsor to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Loading Sponsor Hub...</p>
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Profile Incomplete</h1>
            <p className="text-muted-foreground mb-4">
              Your basic user account exists, but your Sponsor profile has not
              been finalized.
            </p>
            <p className="text-sm">
              Please complete your profile information to appear on the site.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                toast({
                  title: "Action needed",
                  description:
                    "Implement button action to show the profile creation form.",
                })
              }
            >
              Go to Profile Creation
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const tierColors = {
    Platinum: "bg-gray-200 text-black",
    Gold: "bg-yellow-500 text-black",
    Silver: "bg-gray-400 text-black",
    Bronze: "bg-amber-700 text-white",
    Partner: "bg-blue-600 text-white",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-12">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader className="border-b flex-row items-center justify-between p-6">
            <CardTitle className="text-3xl flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-primary" />
              Sponsor Dashboard: {profileData?.company_name}
            </CardTitle>
            {profileData?.tier && (
              <span
                className={`px-4 py-1 text-sm font-semibold uppercase rounded-full ${
                  tierColors[profileData.tier]
                }`}
              >
                {profileData.tier} Tier
              </span>
            )}
          </CardHeader>

          <CardContent className="p-6 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Public Profile
              </h3>
              {profileData?.logo_url ? (
                <img
                  src={SUPABASE_IMAGE_URL + profileData.logo_url}
                  alt={`${profileData.company_name} Logo`}
                  className="w-full h-auto max-h-48 object-contain border rounded-lg p-2 bg-gray-50"
                />
              ) : (
                <div className="h-48 w-full flex items-center justify-center border rounded-lg bg-gray-100 text-muted-foreground">
                  No Logo Uploaded
                </div>
              )}

              <div className="space-y-1">
                <h4 className="font-medium text-gray-800">
                  Company Description:
                </h4>
                <p className="text-sm text-muted-foreground">
                  {profileData?.description ||
                    "No public description provided."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Contact & Links
              </h3>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium">Company Name</p>
                  <p className="text-muted-foreground">
                    {profileData?.company_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium">Contact Email</p>
                  <p className="text-muted-foreground">
                    {profileData?.contact_email}
                  </p>
                </div>
              </div>

              {profileData?.website && (
                <div className="flex items-center space-x-3">
                  <LinkIcon className="w-5 h-5 text-gray-500" />
                  <div className="text-sm">
                    <p className="font-medium">Website</p>
                    <a
                      href={
                        profileData.website.startsWith("http")
                          ? profileData.website
                          : `https://${profileData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profileData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-end p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Data verified by League Admin.
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorDashboard;
