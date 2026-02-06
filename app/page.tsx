"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  XCircle,
  Smartphone,
  MapPin,
  IndianRupee,
  Filter,
  Download,
} from "lucide-react";
import { KPICard } from "@/src/components/kpi-card";
import { ClientOnly } from "@/src/components/client-only";
import { AreaChartComponent } from "@/src/components/charts/area-chart-component";
import { BarChartComponent } from "@/src/components/charts/bar-chart-component";
import { PieChartComponent } from "@/src/components/charts/pie-chart-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  formatCurrency,
  getDateRange,
  getParkingWiseStats,
} from "@/src/lib/analytics";
import { generateAnalyticsReport } from "@/src/lib/pdf-generator";
import { parkings } from "@/src/data/parkings";
import { bookings } from "@/src/data/bookings";
import { BookingType, BookingStatus } from "@/src/types";

export default function Home() {
  const [selectedParking, setSelectedParking] = useState<string>("total");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get date range based on filter
  const dateRange = getDateRange(dateFilter as 'today' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all');

  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!dateRange) return bookings;
    return bookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
    });
  }, [dateRange]);

  // Calculate KPI data for current period
  const currentPeriodStats = useMemo(() => {
    const completed = filteredBookings.filter(b => b.status !== BookingStatus.CANCELLED);
    const totalBookings = filteredBookings.length;
    const totalEarnings = completed.reduce((sum, b) => sum + b.amount, 0);
    const totalCancellations = filteredBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    const onAppBookings = filteredBookings.filter(b => b.bookingType === BookingType.PRE_BOOKED).length;
    const onSiteBookings = filteredBookings.filter(b => b.bookingType === BookingType.ON_SITE).length;

    return {
      totalBookings,
      totalEarnings,
      totalCancellations,
      onAppBookings,
      onSiteBookings,
    };
  }, [filteredBookings]);

  // Calculate previous period stats for growth comparison
  const { bookingsGrowth, earningsGrowth } = useMemo(() => {
    if (dateFilter === 'all' || !dateRange) {
      return { bookingsGrowth: 0, earningsGrowth: 0 };
    }

    // Calculate previous period (same duration as current)
    const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
    const prevStart = new Date(dateRange.start.getTime() - periodDuration);
    const prevEnd = new Date(dateRange.start.getTime() - 1);

    const prevBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= prevStart && bookingDate <= prevEnd;
    });

    const prevCompleted = prevBookings.filter(b => b.status !== BookingStatus.CANCELLED);
    const prevTotalBookings = prevBookings.length;
    const prevTotalEarnings = prevCompleted.reduce((sum, b) => sum + b.amount, 0);

    const bookingsGrowth = prevTotalBookings > 0
      ? ((currentPeriodStats.totalBookings - prevTotalBookings) / prevTotalBookings) * 100
      : 0;

    const earningsGrowth = prevTotalEarnings > 0
      ? ((currentPeriodStats.totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100
      : 0;

    return { bookingsGrowth, earningsGrowth };
  }, [dateFilter, dateRange, currentPeriodStats]);

  // Get daily stats for charts
  const dailyStats = useMemo(() => {
    const grouped: Record<string, { bookings: number; earnings: number }> = {};
    
    filteredBookings.forEach((booking) => {
      const date = format(new Date(booking.startTime), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = { bookings: 0, earnings: 0 };
      }
      grouped[date].bookings++;
      if (booking.status !== BookingStatus.CANCELLED) {
        grouped[date].earnings += booking.amount;
      }
    });

    return Object.entries(grouped)
      .map(([date, stats]) => ({
        date,
        bookings: stats.bookings,
        earnings: Math.round(stats.earnings / 1000),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [filteredBookings]);

  // Get monthly stats for bar chart
  const monthlyStats = useMemo(() => {
    const grouped: Record<string, { bookings: number; earnings: number }> = {};
    
    filteredBookings.forEach((booking) => {
      const month = format(new Date(booking.startTime), "yyyy-MM");
      if (!grouped[month]) {
        grouped[month] = { bookings: 0, earnings: 0 };
      }
      grouped[month].bookings++;
      if (booking.status !== BookingStatus.CANCELLED) {
        grouped[month].earnings += booking.amount;
      }
    });

    return Object.entries(grouped)
      .map(([month, stats]) => ({
        label: format(new Date(month + "-01"), "MMM yyyy"),
        bookings: stats.bookings,
        earnings: Math.round(stats.earnings / 1000),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-6);
  }, [filteredBookings]);

  // Get booking type split based on selected parking
  const bookingTypeSplit = useMemo(() => {
    const parkingBookings = selectedParking === "total"
      ? filteredBookings
      : filteredBookings.filter(b => b.parkingId === selectedParking);
    
    const onAppCount = parkingBookings.filter(b => b.bookingType === BookingType.PRE_BOOKED).length;
    const onSiteCount = parkingBookings.filter(b => b.bookingType === BookingType.ON_SITE).length;
    
    return [
      { name: "On-App Bookings", value: onAppCount },
      { name: "On-Site Bookings", value: onSiteCount },
    ];
  }, [selectedParking, filteredBookings]);
  
  const parkingStats = selectedParking === "total"
    ? {
        totalBookings: currentPeriodStats.totalBookings,
        earnings: currentPeriodStats.totalEarnings,
        cancellationRate: currentPeriodStats.totalBookings > 0 
          ? (currentPeriodStats.totalCancellations / currentPeriodStats.totalBookings) * 100 
          : 0,
        onAppBookings: currentPeriodStats.onAppBookings,
        onSiteBookings: currentPeriodStats.onSiteBookings,
        peakHours: [],
      }
    : getParkingWiseStats(selectedParking);

  const areaChartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
    earnings: {
      label: "Earnings (₹K)",
      color: "hsl(var(--chart-2))",
    },
  };

  const barChartConfig = {
    bookings: {
      label: "Total Bookings",
      color: "hsl(var(--chart-3))",
    },
    earnings: {
      label: "Revenue (₹K)",
      color: "hsl(var(--chart-4))",
    },
  };

  const pieChartData = bookingTypeSplit.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: index === 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
  }));

  const getDateFilterLabel = () => {
    switch(dateFilter) {
      case 'today': return 'Today';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      case 'lastYear': return 'Last Year';
      default: return 'All Time';
    }
  };

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateAnalyticsReport(
        {
          dateFilter: getDateFilterLabel(),
          totalBookings: currentPeriodStats.totalBookings,
          totalEarnings: currentPeriodStats.totalEarnings,
          totalCancellations: currentPeriodStats.totalCancellations,
          onAppBookings: currentPeriodStats.onAppBookings,
          onSiteBookings: currentPeriodStats.onSiteBookings,
          bookingsGrowth,
          earningsGrowth,
          dateRange,
        }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header with Date Filter */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground text-base">
            Real-time parking analytics and key metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownloadReport}
            disabled={isGeneratingPDF}
            className="h-10 px-4 bg-primary hover:bg-primary/90 shadow-md"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Download Report'}
          </Button>
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Time Period
          </label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 h-10 shadow-sm border-2 border-primary/20 hover:border-primary/40 transition-colors font-medium">
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
      </div>

      {/* Period Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm px-3 py-1">
          <Calendar className="h-3 w-3 mr-1" />
          {getDateFilterLabel()} - {currentPeriodStats.totalBookings} bookings
        </Badge>
        {dateFilter !== 'all' && bookingsGrowth !== 0 && (
          <Badge variant={bookingsGrowth >= 0 ? "default" : "destructive"} className="text-sm px-3 py-1">
            {bookingsGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(bookingsGrowth).toFixed(1)}% vs previous period
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <ClientOnly fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1,2,3,4,5].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard
            title="Total Bookings"
            value={currentPeriodStats.totalBookings}
            icon={Calendar}
            trend={dateFilter !== 'all' ? bookingsGrowth : undefined}
            description={dateFilter !== 'all' ? "from previous period" : "all time"}
          />
          <KPICard
            title="Total Earnings"
            value={formatCurrency(currentPeriodStats.totalEarnings)}
            icon={IndianRupee}
            trend={dateFilter !== 'all' ? earningsGrowth : undefined}
            description={dateFilter !== 'all' ? "from previous period" : "all time"}
          />
          <KPICard
            title="On-App Bookings"
            value={currentPeriodStats.onAppBookings}
            icon={Smartphone}
            description="Pre-booked via app"
          />
          <KPICard
            title="On-Site Bookings"
            value={currentPeriodStats.onSiteBookings}
            icon={MapPin}
            description="Walk-in bookings"
          />
          <KPICard
            title="Cancellations"
            value={currentPeriodStats.totalCancellations}
            icon={XCircle}
            description={`${currentPeriodStats.totalBookings > 0 ? ((currentPeriodStats.totalCancellations / currentPeriodStats.totalBookings) * 100).toFixed(1) : 0}% rate`}
          />
        </div>
      </ClientOnly>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <AreaChartComponent
          data={dailyStats}
          config={areaChartConfig}
          title="Daily Performance Trends"
          description={`Last ${dailyStats.length} days - Bookings and revenue (in thousands)`}
          dataKeys={["bookings", "earnings"]}
          trend={dateFilter !== 'all' && bookingsGrowth !== 0 ? {
            value: bookingsGrowth,
            label: "Bookings growth vs previous period",
          } : undefined}
        />
        <BarChartComponent
          data={monthlyStats}
          config={barChartConfig}
          title="Monthly Performance Comparison"
          description="Monthly bookings volume and revenue trends (in thousands of rupees)"
          dataKeys={["bookings", "earnings"]}
          trend={dateFilter !== 'all' && earningsGrowth !== 0 ? {
            value: earningsGrowth,
            label: "Revenue growth from previous period",
          } : undefined}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <PieChartComponent
          data={pieChartData}
          title="Booking Type Distribution"
          description={selectedParking === "total" ? "On-app vs On-site bookings (All Parkings)" : `On-app vs On-site bookings (${parkings.find(p => p.id === selectedParking)?.name})`}
          totalLabel="Bookings"
        />

        {/* Parking-wise Analytics Card */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Parking-Wise Analytics</CardTitle>
            <CardDescription className="text-sm">
              Select a parking location to view detailed stats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Select Parking Location
              </label>
              <Select value={selectedParking} onValueChange={setSelectedParking}>
                <SelectTrigger className="w-full h-12 shadow-md border-2 border-primary/20 hover:border-primary/40 transition-colors font-medium">
                  <SelectValue placeholder="Select parking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">All Parkings (Total)</SelectItem>
                  {parkings.map((parking) => (
                    <SelectItem key={parking.id} value={parking.id}>
                      {parking.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ClientOnly>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">
                    Total Bookings
                  </span>
                  <span className="font-bold text-lg">{parkingStats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">Earnings</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(parkingStats.earnings)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">
                    Cancellation Rate
                  </span>
                  <span className="font-bold text-lg">
                    {parkingStats.cancellationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">
                    On-App Bookings
                  </span>
                  <span className="font-bold text-lg text-blue-500">{parkingStats.onAppBookings}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium text-foreground">
                    On-Site Bookings
                  </span>
                  <span className="font-bold text-lg text-cyan-500">{parkingStats.onSiteBookings}</span>
                </div>

                {selectedParking !== "total" && parkingStats.peakHours.length > 0 && (
                  <div className="pt-4 mt-2 border-t">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Peak Hours
                    </p>
                    <div className="space-y-2">
                      {parkingStats.peakHours.slice(0, 3).map((peak) => (
                        <div
                          key={peak.hour}
                          className="flex justify-between items-center py-2 px-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {peak.hour}:00 - {peak.hour + 1}:00
                          </span>
                          <span className="font-bold text-sm text-primary">{peak.count} bookings</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

