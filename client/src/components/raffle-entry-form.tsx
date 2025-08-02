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

const raffleEntrySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{3}-\d{3}-\d{4}$/, "Phone must be in format 555-123-4567"),
});

type RaffleEntryForm = z.infer<typeof raffleEntrySchema>;

export function RaffleEntryForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RaffleEntryForm>({
    resolver: zodResolver(raffleEntrySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
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
      form.reset();
      toast({
        title: "Success!",
        description: `Thank you ${data.firstName}! Your raffle entry has been submitted.`,
        className: "bg-green-100 border-green-200 text-green-800",
      });
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
    
    // Format as XXX-XXX-XXXX
    if (digits.length >= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    return digits;
  };

  return (
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
                  <p className="text-sm text-gray-500 mt-1">Format: 555-123-4567</p>
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
  );
}
