import { RaffleEntryForm } from "@/components/raffle-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { AdminLogin } from "@/components/admin-login";

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
                variant="ghost"
                onClick={() => setShowAdminLogin(true)}
                className="text-gray-600 hover:text-blueberry-500"
              >
                <i className="fas fa-cog mr-2"></i>
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div 
            className="relative bg-cover bg-center h-48 rounded-2xl mb-6 shadow-xl bg-gradient-to-r from-blueberry-800/80 to-church-purple/60 flex items-center justify-center"
          >
            <div className="text-center text-white px-4">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <i className="fas fa-gift text-church-gold mr-2"></i>
                Blueberry Festival Raffle
              </h1>
              <p className="text-lg opacity-90">Enter for a chance to win amazing prizes!</p>
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <RaffleEntryForm />

        {/* Festival Info */}
        <Card className="shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              <i className="fas fa-calendar-alt text-church-gold mr-2"></i>
              Festival Information
            </h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt text-blueberry-500"></i>
                <span>Pathway Vineyard Church GNG Campus</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-clock text-blueberry-500"></i>
                <span>Saturday, July 15th - 10:00 AM to 4:00 PM</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-gift text-blueberry-500"></i>
                <span>Amazing prizes and blueberry treats await!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}
    </div>
  );
}
