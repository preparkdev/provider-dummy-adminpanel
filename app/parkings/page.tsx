"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { MapPin, TrendingUp, Clock, ArrowUpDown, Calendar } from "lucide-react";
import { BarChartComponent } from "@/src/components/charts/bar-chart-component";
import { getAllParkingStats, formatCurrency, getDateRange } from "@/src/lib/analytics";
import { parkings as allParkings } from "@/src/data/parkings";
import { ClientOnly } from "@/src/components/client-only";

type SortOption = "earnings-desc" | "earnings-asc" | "bookings-desc" | "bookings-asc" | "name-asc" | "name-desc";

export default function ParkingsPage() {
  const [sortBy, setSortBy] = useState<SortOption>("earnings-desc");
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("all");
  
  const dateFilter = getDateRange(dateRange as 'today' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all');
  const allParkingStats = getAllParkingStats(dateFilter?.start, dateFilter?.end);

  // Sort parkings based on selected option
  const sortedParkings = [...allParkings].sort((a, b) => {
    const statsA = allParkingStats.find((s) => s.parkingId === a.id);
    const statsB = allParkingStats.find((s) => s.parkingId === b.id);

    switch (sortBy) {
      case "earnings-desc":
        return (statsB?.earnings || 0) - (statsA?.earnings || 0);
      case "earnings-asc":
        return (statsA?.earnings || 0) - (statsB?.earnings || 0);
      case "bookings-desc":
        return (statsB?.totalBookings || 0) - (statsA?.totalBookings || 0);
      case "bookings-asc":
        return (statsA?.totalBookings || 0) - (statsB?.totalBookings || 0);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Chart data for comparison
  const comparisonData = sortedParkings.map((parking) => {
    const stats = allParkingStats.find((s) => s.parkingId === parking.id);
    return {
      label: parking.name.split(" ")[0] || parking.id,
      bookings: stats?.totalBookings || 0,
      earnings: (stats?.earnings || 0) / 1000,
    };
  });

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
    earnings: {
      label: "Earnings (₹K)",
      color: "hsl(var(--chart-4))",
    },
  };

  const selectedParking = allParkings.find((p) => p.id === selectedParkingId);
  const selectedStats = allParkingStats.find((s) => s.parkingId === selectedParkingId);

  return (
    <ClientOnly>
      <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Parking Locations
          </h2>
          <p className="text-muted-foreground text-base">
            Top performing parking locations by revenue
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          {/* Date Range Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Time Period
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 h-10 shadow-sm border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              Sort By
            </label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-50 h-10 shadow-sm border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earnings-desc">Highest Earnings</SelectItem>
                <SelectItem value="earnings-asc">Lowest Earnings</SelectItem>
                <SelectItem value="bookings-desc">Most Bookings</SelectItem>
                <SelectItem value="bookings-asc">Least Bookings</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Compact Parking Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedParkings.map((parking, index) => {
          const stats = allParkingStats.find((s) => s.parkingId === parking.id);

          return (
            <Card
              key={parking.id}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.03] duration-200 hover:border-primary/40 relative overflow-hidden group"
              onClick={() => setSelectedParkingId(parking.id)}
            >
              {/* Rank Badge */}
              {sortBy.startsWith("earnings") && index < 3 && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className="shadow-lg font-bold"
                  >
                    #{index + 1}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold leading-tight">
                      {parking.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {parking.location}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Primary Metric - Earnings */}
                <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(stats?.earnings || 0)}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-sm pt-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="font-medium">{stats?.totalBookings || 0} bookings</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Click for details →
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <BarChartComponent
        data={comparisonData}
        config={chartConfig}
        title="Parking Performance Comparison"
        description="Bookings and earnings across all locations"
        dataKeys={["bookings", "earnings"]}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selectedParkingId} onOpenChange={(open: boolean) => !open && setSelectedParkingId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedParking && selectedStats && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedParking.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedParking.location}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Capacity</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedParking.capacity} slots</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Price/Hour</p>
                    <p className="text-2xl font-bold text-slate-900">₹{selectedParking.pricePerHour}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold text-primary">{selectedStats.totalBookings}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedStats.earnings)}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-slate-900">Performance Metrics</h3>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Utilization Rate</span>
                    <span className="font-bold text-lg text-slate-900">
                      {((selectedStats.totalBookings / selectedParking.capacity) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Cancellation Rate</span>
                    <span className="font-bold text-lg text-slate-900">
                      {selectedStats.cancellationRate.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">On-App Bookings</span>
                    <span className="font-bold text-lg text-blue-500">
                      {selectedStats.onAppBookings}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">On-Site Bookings</span>
                    <span className="font-bold text-lg text-cyan-500">
                      {selectedStats.onSiteBookings}
                    </span>
                  </div>
                </div>

                {/* Peak Hours */}
                {selectedStats.peakHours?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900">
                      <Clock className="h-5 w-5 text-primary" />
                      Peak Hours
                    </h3>
                    <div className="space-y-2">
                      {selectedStats.peakHours.slice(0, 5).map((peak) => (
                        <div
                          key={peak.hour}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {peak.hour}:00 - {peak.hour + 1}:00
                          </span>
                          <span className="font-bold text-primary">
                            {peak.count} bookings
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ClientOnly>
  );
}
