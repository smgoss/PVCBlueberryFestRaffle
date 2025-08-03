import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, MapPin, Clock } from "lucide-react";

const raffleEntrySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  email: z.string().email("Please enter a valid email address").max(255, "Email too long"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{3}-\d{3}-\d{4}$/, "Phone must be exactly 10 digits in format 555-123-4567")
    .refine((phone) => phone.replace(/\D/g, '').length === 10, "Phone number must be exactly 10 digits"),
});

type RaffleEntryForm = z.infer<typeof raffleEntrySchema>;

export function RaffleEntryForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<RaffleEntryForm>({
    resolver: zodResolver(raffleEntrySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RaffleEntryForm) => {
      const response = await apiRequest("POST", "/api/raffle-entries", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitted(true);
      setShowSuccessModal(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RaffleEntryForm) => {
    mutation.mutate(data);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to exactly 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limitedDigits.length >= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6, 10)}`;
    } else if (limitedDigits.length >= 3) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    }
    return limitedDigits;
  };

  return (
    <>
      <Card className="shadow-xl mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Enter the Raffle</h2>
            <p className="text-gray-600">Fill out your information below to enter. One entry per person!</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        <i className="fas fa-user text-blueberry-500 mr-2"></i>
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your first name"
                          {...field}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueberry-500 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        <i className="fas fa-user text-blueberry-500 mr-2"></i>
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your last name"
                          {...field}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueberry-500 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      <i className="fas fa-envelope text-blueberry-500 mr-2"></i>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueberry-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      <i className="fas fa-phone text-blueberry-500 mr-2"></i>
                      Cell Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="555-123-4567"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueberry-500 focus:border-transparent"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-1">Must be exactly 10 digits (Format: 555-123-4567)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-blueberry-500 to-church-purple text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blueberry-600 hover:to-church-purple/90 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {mutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ticket-alt mr-2"></i>
                    Enter Raffle
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md">
            <div className="text-center">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Successful!</h2>
              <h3 className="text-xl font-semibold text-blueberry-600 mb-4">Also, You're Invited!</h3>
              
              <div className="space-y-3 text-gray-600 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="text-blueberry-500" size={18} />
                  <span className="font-medium">Join Us Sunday Mornings at 9:30am</span>
                </div>
                
                <div className="flex items-start justify-center space-x-2">
                  <MapPin className="text-blueberry-500 mt-1" size={18} />
                  <div className="text-center">
                    <div className="font-medium">Burchard A. Dunn School</div>
                    <div>667 Morse Rd, New Gloucester, ME 04260</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-blueberry-500 hover:bg-blueberry-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
