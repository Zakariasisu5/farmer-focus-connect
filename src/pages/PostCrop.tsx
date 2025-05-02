
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket, ghanaRegions } from "@/contexts/MarketContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Form schema definition
const formSchema = z.object({
  crop_name: z.string().min(2, { message: "Crop name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  price: z.string().min(1, { message: "Price is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const PostCrop: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Common units for agricultural products
  const units = ["kg", "bag", "crate", "box", "ton", "piece", "dozen", "bundle"];

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop_name: "",
      quantity: "",
      unit: "kg",
      price: "",
      location: "",
      description: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error(t("mustBeLoggedIn"));
      return;
    }

    try {
      // Create the listing data object, ensuring user_id is properly formatted
      // Avoid converting user.id to string as it should already be a UUID
      const listingData = {
        user_id: user.id, // Use the ID directly without conversion
        crop_name: data.crop_name,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        price: parseFloat(data.price),
        location: data.location,
        description: data.description || null,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
        is_available: true,
      };

      // For debugging
      console.log("Submitting listing data:", listingData);

      const { error } = await supabase.from("crop_listings").insert(listingData);

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      toast.success(t("cropListingPosted"));
      navigate("/marketplace");
    } catch (error) {
      console.error("Error posting crop listing:", error);
      toast.error(t("errorPostingListing"));
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="bg-farm-green p-4 text-white shadow-md">
        <div className="container px-4 mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-white" 
              onClick={() => navigate("/marketplace")}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">{t("postCropListing")}</h1>
          </div>
          <p className="text-sm mt-1">{t("shareYourProduceWithBuyers")}</p>
        </div>
      </div>

      {/* Form */}
      <div className="container px-4 py-6 mx-auto max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Information Section */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-medium text-lg mb-4">{t("productInformation")}</h2>
              
              <FormField
                control={form.control}
                name="crop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cropName")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterCropName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("quantity")}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("unit")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectUnit")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>{t("pricePerUnit")} (₵)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-medium text-lg mb-4">{t("location")}</h2>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("region")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectRegion")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ghanaRegions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description Section */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-medium text-lg mb-4">{t("description")}</h2>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("productDescription")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("describeYourCrop")} 
                        className="resize-none" 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>{t("includeQualityAndFreshness")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information Section */}
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-medium text-lg mb-4">{t("contactInformation")}</h2>
              
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterPhoneNumber")} {...field} />
                    </FormControl>
                    <FormDescription>{t("phoneOptional")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterEmail")} {...field} />
                    </FormControl>
                    <FormDescription>{t("emailOptional")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full bg-farm-green hover:bg-farm-green/90">
              {t("postListing")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PostCrop;
