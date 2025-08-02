import { AdminDashboard } from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Admin() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blueberry-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-4 border-blueberry-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-church text-blueberry-500 text-2xl"></i>
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
