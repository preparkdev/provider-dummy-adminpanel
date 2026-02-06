"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
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
import { Badge } from "@/src/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Filter } from "lucide-react";
import {
  formatCurrency,
  getDateRange,
} from "@/src/lib/analytics";
import { parkings } from "@/src/data/parkings";
import { bookings } from "@/src/data/bookings";
import { BookingType, BookingStatus } from "@/src/types";

export default function AnalyticsPage() {
  const [dateFilter, setDateFilter] = useState<string>("all");

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

  // Calculate stats from filtered bookings
  const { monthlyStats, dailyStats, allParkingStats, bookingTypeSplit, totalRevenue, totalBookings } = useMemo(() => {
    // Monthly stats
    const monthlyGrouped: Record<string, { bookings: number; earnings: number }> = {};
    filteredBookings.forEach((booking) => {
      const month = format(new Date(booking.startTime), "yyyy-MM");
      if (!monthlyGrouped[month]) {
        monthlyGrouped[month] = { bookings: 0, earnings: 0 };
      }
      monthlyGrouped[month].bookings++;
      if (booking.status !== BookingStatus.CANCELLED) {
        monthlyGrouped[month].earnings += booking.amount;
      }
    });

    const monthlyStats = Object.entries(monthlyGrouped)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Daily stats
    const dailyGrouped: Record<string, { bookings: number; earnings: number; cancellations: number }> = {};
    filteredBookings.forEach((booking) => {
      const date = format(new Date(booking.startTime), "yyyy-MM-dd");
      if (!dailyGrouped[date]) {
        dailyGrouped[date] = { bookings: 0, earnings: 0, cancellations: 0 };
      }
      dailyGrouped[date].bookings++;
      if (booking.status === BookingStatus.CANCELLED) {
        dailyGrouped[date].cancellations++;
      } else {
        dailyGrouped[date].earnings += booking.amount;
      }
    });

    const dailyStats = Object.entries(dailyGrouped)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Parking stats
    const parkingGrouped: Record<string, { totalBookings: number; earnings: number; onAppBookings: number; onSiteBookings: number }> = {};
    filteredBookings.forEach((booking) => {
      if (!parkingGrouped[booking.parkingId]) {
        parkingGrouped[booking.parkingId] = { totalBookings: 0, earnings: 0, onAppBookings: 0, onSiteBookings: 0 };
      }
      parkingGrouped[booking.parkingId].totalBookings++;
      if (booking.status !== BookingStatus.CANCELLED) {
        parkingGrouped[booking.parkingId].earnings += booking.amount;
      }
      if (booking.bookingType === BookingType.PRE_BOOKED) {
        parkingGrouped[booking.parkingId].onAppBookings++;
      } else {
        parkingGrouped[booking.parkingId].onSiteBookings++;
      }
    });

    const allParkingStats = Object.entries(parkingGrouped).map(([parkingId, stats]) => ({
      parkingId,
      ...stats,
    }));

    // Booking type split
    const onAppBookings = filteredBookings.filter(b => b.bookingType === BookingType.PRE_BOOKED).length;
    const onSiteBookings = filteredBookings.filter(b => b.bookingType === BookingType.ON_SITE).length;
    const bookingTypeSplit = [
      { name: "On-App Bookings", value: onAppBookings },
      { name: "On-Site Bookings", value: onSiteBookings },
    ];

    // Calculate total revenue and bookings
    const totalRevenue = allParkingStats.reduce((sum, stat) => sum + stat.earnings, 0);
    const totalBookings = allParkingStats.reduce((sum, stat) => sum + stat.totalBookings, 0);

    return { monthlyStats, dailyStats, allParkingStats, bookingTypeSplit, totalRevenue, totalBookings };
  }, [filteredBookings]);

  // Calculate growth metrics
  const { revenueGrowth, bookingsGrowth } = useMemo(() => {
    if (dateFilter === 'all' || !dateRange || monthlyStats.length < 2) {
      return { revenueGrowth: 0, bookingsGrowth: 0 };
    }

    const lastMonth = monthlyStats[monthlyStats.length - 1];
    const prevMonth = monthlyStats[monthlyStats.length - 2];

    const revenueGrowth = prevMonth.earnings > 0
      ? ((lastMonth.earnings - prevMonth.earnings) / prevMonth.earnings) * 100
      : 0;

    const bookingsGrowth = prevMonth.bookings > 0
      ? ((lastMonth.bookings - prevMonth.bookings) / prevMonth.bookings) * 100
      : 0;

    return { revenueGrowth, bookingsGrowth };
  }, [monthlyStats, dateFilter, dateRange]);

  // Revenue trend over all time
  const revenueData = monthlyStats.map((stat) => ({
    date: format(new Date(stat.month + "-01"), "MMM yyyy"),
    revenue: Math.round(stat.earnings / 1000), // Convert to thousands
    bookings: stat.bookings,
  }));

  const revenueConfig = {
    revenue: {
      label: "Revenue (₹K)",
      color: "hsl(var(--chart-1))",
    },
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-2))",
    },
  };

  // Daily trends (last 60 days)
  const dailyTrendData = dailyStats.slice(-60).map((stat) => ({
    date: format(new Date(stat.date), "MMM dd"),
    bookings: stat.bookings,
    earnings: Math.round(stat.earnings / 1000), // Convert to thousands
    cancellations: stat.cancellations,
  }));

  const dailyConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-3))",
    },
    earnings: {
      label: "Earnings (₹K)",
      color: "hsl(var(--chart-4))",
    },
    cancellations: {
      label: "Cancellations",
      color: "hsl(var(--chart-5))",
    },
  };

  // Parking distribution by earnings
  const parkingEarningsData = allParkingStats
    .sort((a, b) => b.earnings - a.earnings)
    .map((stat, index) => ({
      name: parkings.find((p) => p.id === stat.parkingId)?.name.split(" ")[0] || "Unknown",
      value: stat.earnings,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

  // Booking type comparison by parking
  const parkingBookingData = allParkingStats.map((stat) => ({
    label: parkings.find((p) => p.id === stat.parkingId)?.name.split(" ")[0] || "Unknown",
    onApp: stat.onAppBookings,
    onSite: stat.onSiteBookings,
  }));

  const bookingTypeConfig = {
    onApp: {
      label: "On-App",
      color: "hsl(var(--chart-1))",
    },
    onSite: {
      label: "On-Site",
      color: "hsl(var(--chart-2))",
    },
  };

  // Pie chart data
  const pieData = bookingTypeSplit.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: index === 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))",
  }));

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header with Date Filter */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Advanced Analytics</h2>
          <p className="text-muted-foreground text-base">
            Deep insights into your parking business performance
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Growth Badges */}
      {dateFilter !== 'all' && monthlyStats.length >= 2 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Calendar className="h-3 w-3 mr-1" />
            {totalBookings} total bookings
          </Badge>
          {bookingsGrowth !== 0 && (
            <Badge variant={bookingsGrowth >= 0 ? "default" : "destructive"} className="text-sm px-3 py-1">
              {bookingsGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(bookingsGrowth).toFixed(1)}% bookings growth
            </Badge>
          )}
          {revenueGrowth !== 0 && (
            <Badge variant={revenueGrowth >= 0 ? "default" : "destructive"} className="text-sm px-3 py-1">
              {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(revenueGrowth).toFixed(1)}% revenue growth
            </Badge>
          )}
        </div>
      )}

      {/* Revenue & Bookings Trend */}
      <AreaChartComponent
        data={revenueData}
        config={revenueConfig}
        title="Revenue & Bookings Trend"
        description="Monthly performance over time"
        dataKeys={["revenue", "bookings"]}
      />

      {/* Daily Trends */}
      <AreaChartComponent
        data={dailyTrendData}
        config={dailyConfig}
        title="Daily Performance Trends"
        description="Last 60 days - Bookings, Earnings, and Cancellations"
        dataKeys={["bookings", "earnings", "cancellations"]}
      />

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Parking Earnings Distribution */}
        <PieChartComponent
          data={parkingEarningsData}
          title="Revenue by Parking Location"
          description="Total earnings distribution"
          totalLabel="Total Revenue"
        />

        {/* Booking Type Distribution */}
        <PieChartComponent
          data={pieData}
          title="Booking Type Split"
          description="On-app vs On-site bookings"
          totalLabel="Total Bookings"
        />
      </div>

      {/* Booking Type Comparison */}
      <BarChartComponent
        data={parkingBookingData}
        config={bookingTypeConfig}
        title="Booking Type Comparison by Location"
        description="On-app vs On-site bookings across all parkings"
        dataKeys={["onApp", "onSite"]}
      />

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All-time earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
            <CardDescription>All-time bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalBookings}
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader>
            <CardTitle>Average per Booking</CardTitle>
            <CardDescription>Revenue per booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalRevenue / totalBookings)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
