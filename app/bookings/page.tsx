"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { BookingsTable } from "@/src/components/bookings-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { bookings } from "@/src/data/bookings";
import { BookingStatus } from "@/src/types";
import { useState, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { getDateRange } from "@/src/lib/analytics";
import { ClientOnly } from "@/src/components/client-only";

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<string>("all");

  const dateFilter = getDateRange(dateRange as 'today' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all');

  // Filter bookings based on search query and date range
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= dateFilter.start && bookingDate <= dateFilter.end;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((booking) => 
        booking.id.toLowerCase().includes(query) ||
        booking.userName.toLowerCase().includes(query) ||
        booking.parkingName.toLowerCase().includes(query) ||
        booking.vehicleNumber.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, dateFilter]);

  const activeBookings = filteredBookings.filter(
    (b) => b.status === BookingStatus.ACTIVE || b.status === BookingStatus.CONFIRMED
  );
  const completedBookings = filteredBookings.filter(
    (b) => b.status === BookingStatus.COMPLETED
  );
  const cancelledBookings = filteredBookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  );

  return (
    <ClientOnly>
      <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h2>
          <p className="text-muted-foreground text-base">
            View and manage all parking bookings
          </p>
        </div>

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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Filter and view booking details</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by booking ID, user name, parking name, or car number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="all" className="data-[state=active]:bg-background">
                All {filteredBookings.length > 0 && `(${filteredBookings.length})`}
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-background">
                Active {activeBookings.length > 0 && `(${activeBookings.length})`}
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-background">
                Completed {completedBookings.length > 0 && `(${completedBookings.length})`}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-background">
                Cancelled {cancelledBookings.length > 0 && `(${cancelledBookings.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <BookingsTable bookings={filteredBookings} />
            </TabsContent>
            <TabsContent value="active" className="space-y-4">
              <BookingsTable bookings={activeBookings} />
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <BookingsTable bookings={completedBookings} />
            </TabsContent>
            <TabsContent value="cancelled" className="space-y-4">
              <BookingsTable bookings={cancelledBookings} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </ClientOnly>
  );
}
