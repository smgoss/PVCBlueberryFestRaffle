import { AdminDashboard } from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Church } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(token === 'Jesus4All!');
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Successfully logged in as admin",
        className: "bg-green-100 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admin password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLocation('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blueberry-50 to-blue-100">
        {/* Navigation */}
        <nav className="bg-white shadow-lg border-b-4 border-blueberry-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Church className="text-blueberry-500" size={28} />
                <div className="text-lg font-semibold text-gray-800">
                  <span className="hidden sm:inline">Pathway Vineyard Church GNG Campus</span>
                  <span className="sm:hidden">PVC GNG</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="text-gray-600 hover:text-blueberry-500"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Admin Login */}
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <Church className="text-blueberry-500 mx-auto mb-4" size={48} />
              <h2 className="text-2xl font-semibold text-gray-800">Admin Login</h2>
              <p className="text-gray-600">Enter password to access admin panel</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter admin password"
                          {...field}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blueberry-500 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="flex-1 bg-blueberry-500 hover:bg-blueberry-600"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blueberry-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-4 border-blueberry-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Church className="text-blueberry-500" size={28} />
              <div className="text-lg font-semibold text-gray-800">
                <span className="hidden sm:inline">Pathway Vineyard Church GNG Campus</span>
                <span className="sm:hidden">PVC GNG</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}
