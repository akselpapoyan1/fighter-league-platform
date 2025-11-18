import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import UploadPhoto from "@/components/UploadPhoto";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const DonorForm = ({ name, email }: { name: string; email: string }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email,
    walletAddress: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.walletAddress) {
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
      const fileName = `${name!.replace(
        / /g,
        "_"
      )}_logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("donor_images")
        .upload(filePath, imageFile!);

      if (uploadError) {
        throw new Error(`Logo upload failed: ${uploadError.message}`);
      }
      const logoUrl = uploadData.path;

      const registerPayload = {
        user_type: "DONOR",
        logo_url: logoUrl,
        email,
      };

      const registerRes = await apiClient.post(
        "/donor/register",
        registerPayload
      );

      toast({
        title: "Donor Registration Complete!",
        description:
          registerRes.data.message ||
          "Welcome! Please log in to your new account.",
      });

      navigate("/login");

      setFormData({
        email,
        walletAddress: "",
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
          <Label htmlFor="companyName">Profile Image</Label>
          <UploadPhoto
            preview={preview}
            removeImage={removeImage}
            handleFileChange={handleFileChange}
          />
        </div>
        <div className="space-y-2 flex flex-col items-start">
          <Label htmlFor="walletAddress">Wallet Address*</Label>
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

export default DonorForm;
