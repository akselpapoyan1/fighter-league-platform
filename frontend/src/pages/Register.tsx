import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DonorForm from "@/components/DonorForm";
import FighterForm from "@/components/FighterForm";
import SponsorForm from "@/components/SponsorForm";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-gradient-stripe border-b border-border">
          <div className="container max-w-4xl">
            <h1 className="text-5xl font-bold mb-4">
              Join the <span className="text-primary">League</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Register as a fighter, sponsor, or donor to support the community.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container max-w-2xl">
            <Tabs defaultValue="fighter" className="">
              <TabsList className="">
                <TabsTrigger value="fighter">Register as Fighter</TabsTrigger>
                <TabsTrigger value="sponsor">Register as Sponsor</TabsTrigger>
                <TabsTrigger value="donor">Become a Donor</TabsTrigger>
              </TabsList>

              <TabsContent value="fighter" className="mt-6">
                <FighterForm />
              </TabsContent>
              <TabsContent value="sponsor" className="mt-6">
                <SponsorForm />
              </TabsContent>
              <TabsContent value="donor" className="mt-6">
                <DonorForm />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
