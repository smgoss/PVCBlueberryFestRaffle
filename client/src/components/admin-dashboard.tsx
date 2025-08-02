import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RaffleEntry, Prize, WinnerWithDetails } from "@shared/schema";

const prizeSchema = z.object({
  name: z.string().min(1, "Prize name is required").max(200, "Prize name too long"),
  description: z.string().optional(),
});

type PrizeForm = z.infer<typeof prizeSchema>;

export function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'entries' | 'prizes' | 'winners'>('entries');
  const [showAddPrize, setShowAddPrize] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<RaffleEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const authHeaders = {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  };

  // Queries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/admin/entries'],
    queryFn: async () => {
      const response = await fetch('/api/admin/entries', { headers: authHeaders });
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    },
  });

  const { data: prizes = [], isLoading: prizesLoading } = useQuery({
    queryKey: ['/api/admin/prizes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/prizes', { headers: authHeaders });
      if (!response.ok) throw new Error('Failed to fetch prizes');
      return response.json();
    },
  });

  const { data: winners = [], isLoading: winnersLoading } = useQuery({
    queryKey: ['/api/admin/winners'],
    queryFn: async () => {
      const response = await fetch('/api/admin/winners', { headers: authHeaders });
      if (!response.ok) throw new Error('Failed to fetch winners');
      return response.json();
    },
  });

  // Mutations
  const drawWinnerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/draw-winner', {
        method: 'POST',
        headers: authHeaders,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (winner) => {
      setSelectedWinner(winner);
      setShowWinnerModal(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const confirmWinnerMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch('/api/admin/confirm-winner', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      if (!response.ok) throw new Error('Failed to confirm winner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/winners'] });
      setShowWinnerModal(false);
      setSelectedWinner(null);
      toast({
        title: "Success",
        description: "Winner confirmed successfully",
        className: "bg-green-100 border-green-200 text-green-800",
      });
    },
  });

  const addPrizeMutation = useMutation({
    mutationFn: async (data: PrizeForm) => {
      const response = await fetch('/api/admin/prizes', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add prize');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prizes'] });
      setShowAddPrize(false);
      prizeForm.reset();
      toast({
        title: "Success",
        description: "Prize added successfully",
        className: "bg-green-100 border-green-200 text-green-800",
      });
    },
  });

  const claimPrizeMutation = useMutation({
    mutationFn: async ({ winnerId, prizeId }: { winnerId: string; prizeId: string }) => {
      const response = await fetch(`/api/admin/winners/${winnerId}/claim-prize`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizeId }),
      });
      if (!response.ok) throw new Error('Failed to claim prize');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/winners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prizes'] });
      toast({
        title: "Success",
        description: "Prize claimed successfully",
        className: "bg-green-100 border-green-200 text-green-800",
      });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: async (winnerId: string) => {
      const response = await fetch(`/api/admin/winners/${winnerId}/no-show`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Failed to mark as no-show');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/winners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/entries'] });
      toast({
        title: "Success",
        description: "Winner marked as no-show. You can now draw a new winner.",
        className: "bg-green-100 border-green-200 text-green-800",
      });
    },
  });

  const prizeForm = useForm<PrizeForm>({
    resolver: zodResolver(prizeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onAddPrize = (data: PrizeForm) => {
    addPrizeMutation.mutate(data);
  };

  const filteredEntries = entries.filter((entry: any) =>
    `${entry.firstName} ${entry.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.phone.includes(searchTerm)
  );

  const availablePrizes = prizes.filter((prize: Prize) => prize.isAvailable);

  const eligibleEntriesCount = entries.filter((entry: any) => entry.status === 'eligible').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Header */}
      <Card className="shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                <i className="fas fa-cogs text-blueberry-500 mr-2"></i>
                Raffle Administration
              </h1>
              <p className="text-gray-600">Manage entries, prizes, and winners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tabs */}
      <Card className="shadow-xl">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" role="tablist">
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'entries'
                  ? 'border-blueberry-500 text-blueberry-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Entries ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('prizes')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'prizes'
                  ? 'border-blueberry-500 text-blueberry-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-gift mr-2"></i>
              Prizes ({prizes.length})
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'winners'
                  ? 'border-blueberry-500 text-blueberry-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-trophy mr-2"></i>
              Winners ({winners.length})
            </button>
          </nav>
        </div>

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">Raffle Entries</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2"
                />
                <Button
                  onClick={() => drawWinnerMutation.mutate()}
                  disabled={drawWinnerMutation.isPending || eligibleEntriesCount === 0}
                  className="bg-gradient-to-r from-church-gold to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  {drawWinnerMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Drawing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-dice mr-2"></i>
                      Draw Winner
                    </>
                  )}
                </Button>
              </div>
            </div>

            {entriesLoading ? (
              <div className="text-center py-8">Loading entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No entries match your search.' : 'No entries found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Entry Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEntries.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.firstName} {entry.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(entry.entryTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              entry.status === 'eligible'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {entry.status === 'eligible' ? 'Eligible' : 'Already Won'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}

        {/* Prizes Tab */}
        {activeTab === 'prizes' && (
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">Prize Management</h2>
              <Button
                onClick={() => setShowAddPrize(true)}
                className="bg-blueberry-500 hover:bg-blueberry-600"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Prize
              </Button>
            </div>

            {showAddPrize && (
              <Card className="bg-gray-50 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Prize</h3>
                  <Form {...prizeForm}>
                    <form onSubmit={prizeForm.handleSubmit(onAddPrize)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={prizeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Prize name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={prizeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Prize description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={addPrizeMutation.isPending}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowAddPrize(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {prizesLoading ? (
              <div className="text-center py-8">Loading prizes...</div>
            ) : prizes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No prizes found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prizes.map((prize: Prize) => (
                  <Card key={prize.id} className="bg-gradient-to-br from-blueberry-50 to-purple-50 border-blueberry-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{prize.name}</h4>
                          <p className="text-sm text-gray-600">{prize.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              prize.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prize.isAvailable ? 'Available' : 'Claimed'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">Winner Management</h2>
              <div className="text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1"></i>
                Manage prize claims and re-draws
              </div>
            </div>

            {winnersLoading ? (
              <div className="text-center py-8">Loading winners...</div>
            ) : winners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No winners drawn yet.</div>
            ) : (
              <div className="space-y-4">
                {winners.map((winner: WinnerWithDetails) => (
                  <Card
                    key={winner.id}
                    className={`border ${
                      winner.claimedAt
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                        : winner.isNoShow
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <i
                              className={`text-xl ${
                                winner.claimedAt
                                  ? 'fas fa-trophy text-green-600'
                                  : winner.isNoShow
                                  ? 'fas fa-times-circle text-red-600'
                                  : 'fas fa-clock text-orange-500'
                              }`}
                            ></i>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {winner.entry?.firstName} {winner.entry?.lastName}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                winner.claimedAt
                                  ? 'bg-green-100 text-green-800'
                                  : winner.isNoShow
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {winner.claimedAt
                                ? 'Prize Claimed'
                                : winner.isNoShow
                                ? 'No Show'
                                : 'Pending Pickup'}
                            </span>
                          </div>
                          <p className="text-gray-600">Phone: {winner.entry?.phone}</p>
                          {winner.prize && (
                            <p className="text-gray-600">Won: {winner.prize.name}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Drawn: {new Date(winner.drawnAt).toLocaleString()}
                            {winner.claimedAt && (
                              <> | Claimed: {new Date(winner.claimedAt).toLocaleString()}</>
                            )}
                          </p>
                        </div>
                        {!winner.claimedAt && !winner.isNoShow && (
                          <div className="flex space-x-2">
                            <Select
                              onValueChange={(prizeId) => {
                                claimPrizeMutation.mutate({ winnerId: winner.id, prizeId });
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select claimed prize" />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePrizes.map((prize: Prize) => (
                                  <SelectItem key={prize.id} value={prize.id}>
                                    {prize.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => noShowMutation.mutate(winner.id)}
                              variant="destructive"
                              size="sm"
                            >
                              No Show - Redraw
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Winner Drawing Modal */}
      {showWinnerModal && selectedWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md text-center">
            <div className="mb-6">
              <i className="fas fa-trophy text-church-gold text-6xl mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 Winner Drawn! 🎉</h2>
            </div>
            <Card className="bg-gradient-to-r from-blueberry-50 to-purple-50 mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedWinner.firstName} {selectedWinner.lastName}
                </h3>
                <p className="text-gray-600">{selectedWinner.phone}</p>
              </CardContent>
            </Card>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowWinnerModal(false);
                  setSelectedWinner(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => confirmWinnerMutation.mutate(selectedWinner.id)}
                disabled={confirmWinnerMutation.isPending}
                className="flex-1 bg-blueberry-500 hover:bg-blueberry-600"
              >
                {confirmWinnerMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Confirming...
                  </>
                ) : (
                  "Confirm Winner"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
