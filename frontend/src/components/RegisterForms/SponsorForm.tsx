import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import UploadPhoto from "@/components/UploadPhoto";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea";

interface SponsorProfile {
  company_name: string;
  logo_url: string;
  description: string;
  tier: "Gold" | "Silver" | "Bronze" | "Partner";
}

const SponsorForm = ({ name, email }: { name: string; email: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name,
    websiteUrl: "",
    description: "",
    walletAddress: "",
    tier: "Partner" as SponsorProfile["tier"],
  });

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tier: value as SponsorProfile["tier"] }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.walletAddress || !imageFile) {
      toast({
        title: "Missing required fields",
        description:
          "Please fill in all * required fields and upload an image.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const fileExt = imageFile!.name.split(".").pop();
      const fileName = `${formData.name!.replace(
        / /g,
        "_"
      )}_logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("sponsor-logos")
        .upload(filePath, imageFile!);

      if (uploadError) {
        throw new Error(`Logo upload failed: ${uploadError.message}`);
      }
      const logoUrl = uploadData.path;

      const registerPayload = {
        companyName: formData.name,
        email,
        description: formData.description,
        walletAddress: formData.walletAddress,
        user_type: "SPONSOR",
        logoUrl,
        tier: formData.tier,
      };

      const registerRes = await apiClient.post(
        "/sponsor/register",
        registerPayload
      );

      toast({
        title: "Sponsor Registration Complete!",
        description:
          registerRes.data.message ||
          "Welcome! Please log in to your new account.",
      });

      navigate("/login");

      setFormData({
        name: "",
        websiteUrl: "",
        description: "",
        walletAddress: "",
        tier: "Partner",
      });
      setPreview(null);
      setImageFile(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setImageFile(null);
  };

  return (
    <Card className="p-8 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="companyName">Logo or Your Image *</Label>
          <UploadPhoto
            preview={preview}
            removeImage={removeImage}
            handleFileChange={handleFileChange}
          />
        </div>
        {/* <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="email">Work Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div> */}
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="walletAddress">Wallet Address *</Label>
          <Input
            id="walletAddress"
            value={formData.walletAddress ?? ""}
            onChange={(e) => handleChange("walletAddress", e.target.value)}
            placeholder="Your 0x... wallet address"
          />
          <p className="text-xs text-muted-foreground">
            Link your profile to a user account (optional).
          </p>
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="sponsorLevel">Sponsorship Tier</Label>
          <Select value={formData.tier} onValueChange={handleSelectChange}>
            <SelectTrigger id="tier">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Platinum">Platinum</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Partner">Partner (Default)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="bio">About Company / You</Label>
          <Textarea
            id="bio"
            value={formData.description ?? ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Tell us about your company/you..."
            rows={5}
          />
        </div>
        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SponsorForm;
