/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import apiClient from "@/api/apiClient";

const Login = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const { login, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateBasedOnRole = (userType: string) => {
    switch (userType) {
      case "FIGHTER":
        navigate("/dashboard/fighter");
        break;
      case "ADMIN":
        navigate("/dashboard/admin");
        break;
      case "SPONSOR":
        navigate("/dashboard/sponsor");
        break;
      case "DONOR":
      case "FAN":
      default:
        navigate("/");
    }
  };

  const useTestAdminWallet = () => {
    setWalletAddress("0xMOCK_USER_5");
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please enter a wallet address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { token, user_type } = await login(walletAddress);

      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      toast({ title: "Success", description: "Logged in successfully!" });
      navigateBasedOnRole(user_type);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Check console.";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { token, user_type } = await loginWithEmail(email, password);

      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      toast({ title: "Success", description: "Logged in successfully!" });
      navigateBasedOnRole(user_type);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Check console.";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="p-8 max-w-sm w-full">
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="mt-6">
              <form onSubmit={handleWalletSubmit} className="space-y-6">
                <h1 className="text-2xl font-bold text-center">Wallet Login</h1>
                <div className="space-y-2 flex flex-col items-start">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login with Wallet"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={useTestAdminWallet}
                >
                  Use Test Admin Wallet
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <h1 className="text-2xl font-bold text-center">
                  Sponsor/Donor Login
                </h1>
                <div className="space-y-2 flex flex-col items-start">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex flex-col items-start">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login with Email"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register Here
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
