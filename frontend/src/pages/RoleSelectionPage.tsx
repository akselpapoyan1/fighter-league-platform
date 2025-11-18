import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, Briefcase, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import FighterForm from "@/components/RegisterForms/FighterForm";
import SponsorForm from "@/components/RegisterForms/SponsorForm";
import DonorForm from "@/components/RegisterForms/DonorForm";

const RoleSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-center space-y-4 p-6 bg-card border rounded-lg">
    <div className="flex items-center space-x-3">
      {icon}
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const FighterUpgrade = ({ name, email }: { name: string; email: string }) => (
  <RoleSection
    icon={<Trophy className="w-6 h-6 text-yellow-600" />}
    title="Become a Fighter"
  >
    <FighterForm name={name} email={email} />
  </RoleSection>
);

const SponsorUpgrade = ({ name, email }) => (
  <RoleSection
    icon={<Briefcase className="w-6 h-6 text-green-600" />}
    title="Become a Sponsor"
  >
    <SponsorForm name={name} email={email} />
  </RoleSection>
);

const DonorUpgrade = ({ name, email }) => (
  <RoleSection
    icon={<Briefcase className="w-6 h-6 text-green-600" />}
    title="Become a Donor"
  >
    <DonorForm name={name} email={email} />
  </RoleSection>
);

const RoleSelectionPage = () => {
  const { userType, currentUser } = useAuth();

  const isAlreadyUpgraded =
    userType && userType !== "GUEST" && userType !== "FAN";

  if (isAlreadyUpgraded) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">Access Granted</h1>
        <p>
          You are already logged in as a <strong>{userType}</strong>. No upgrade
          needed.
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">User not found</h1>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  const roles = [
    { value: "Fighter", title: "Become a Fighter" },
    { value: "Sponsor", title: "Become a Sponsor" },
    { value: "Donor", title: "Become a Donor" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-3xl font-extrabold text-primary flex justify-center items-center gap-2">
              <User className="h-7 w-7" />
              Welcome, Guest! Select Your Role
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Your current account is set to{" "}
              <strong>{userType || "GUEST"}</strong>.
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs defaultValue="Fighter" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {roles.map((role) => (
                  <TabsTrigger key={role.value} value={role.value}>
                    {role.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="Fighter" className="mt-6">
                <FighterUpgrade
                  name={currentUser.name}
                  email={currentUser.email}
                />
              </TabsContent>

              <TabsContent value="Sponsor" className="mt-6">
                <SponsorUpgrade
                  name={currentUser.name}
                  email={currentUser.email}
                />
              </TabsContent>

              <TabsContent value="Donor" className="mt-6">
                <DonorUpgrade
                  name={currentUser.name}
                  email={currentUser.email}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RoleSelectionPage;
