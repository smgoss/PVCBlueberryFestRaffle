import { RaffleEntryForm } from "@/components/raffle-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { AdminLogin } from "@/components/admin-login";
import { Church, Settings, Gift, MapPin, Clock, Users } from "lucide-react";
import blueberryBackground from "@assets/generated_images/Fresh_blueberries_background_e1109dfa.png";

export default function Home() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blueberry-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-4 border-blueberry-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Church className="text-blueberry-500" size={28} />
              <div className="text-lg font-semibold text-gray-800">
                <span className="hidden sm:inline">
                  Pathway Vineyard Church GNG Campus
                </span>
                <span className="sm:hidden">PVC GNG</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowAdminLogin(true)}
                className="text-gray-600 hover:text-blueberry-500"
              >
                <Settings className="mr-2" size={16} />
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
            className="relative bg-cover bg-center h-48 rounded-2xl mb-6 shadow-xl flex items-center justify-center"
            style={{
              backgroundImage: `url(${blueberryBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
            <div className="relative text-center text-white px-4 z-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Blueberry Festival Raffle
              </h1>
              <p className="text-lg opacity-90">
                Enter for a chance to win amazing prizes!
              </p>
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <RaffleEntryForm />

        {/* Church Info */}
        <Card className="shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              <Church className="text-church-gold mr-2" size={20} />
              Church Information
            </h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPin className="text-blueberry-500 mt-1" size={18} />
                <div>
                  <div className="font-medium">
                    Pathway Vineyard Church GNG Campus
                  </div>
                  <div>Burchard A. Dunn School</div>
                  <div>667 Morse Rd, New Gloucester, ME 04260</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-blueberry-500" size={18} />
                <span>Sundays at 9:30 AM</span>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="text-blueberry-500 mt-1" size={18} />
                <span>Children's program for kids 6 months through 5th grade</span>
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
