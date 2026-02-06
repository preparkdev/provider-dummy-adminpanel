import { format } from "date-fns";
import {
  Booking,
  BookingType,
  BookingStatus,
  KPIData,
  DailyStats,
  MonthlyStats,
  ParkingStats,
} from "@/src/types";
import { bookings } from "@/src/data/bookings";
import { parkings } from "@/src/data/parkings";

// Helper function to parse amount - handles both string and number
function parseAmount(amount: string | number | undefined | null): number {
  // Handle null/undefined
  if (amount === null || amount === undefined) {
    console.warn("Amount is null or undefined:", amount);
    return 0;
  }

  // If already a number
  if (typeof amount === "number") {
    const result = isNaN(amount) ? 0 : amount;
    if (isNaN(amount)) {
      console.warn("Amount is NaN:", amount);
    }
    return result;
  }

  // If it's a string
  if (typeof amount === "string") {
    // Remove currency symbols, commas, spaces, and any non-numeric characters except decimal point
    const cleaned = amount.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
      console.warn("Failed to parse amount string:", amount, "cleaned:", cleaned);
      return 0;
    }

    return parsed;
  }

  console.warn("Unknown amount type:", typeof amount, amount);
  return 0;
}

// Helper function to format date to YYYY-MM
function formatToMonth(date: string | Date | undefined | null): string {
  if (!date) return "";

  try {
    const d =
      typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      console.warn("Invalid date:", date);
      return "";
    }
    return d.toISOString().slice(0, 7);
  } catch (e) {
    console.error("Error formatting date to month:", date, e);
    return "";
  }
}

/**
 * Calculate total earnings from bookings
 */
export function calculateTotalEarnings(bookingsList: Booking[]): number {
  return bookingsList
    .filter((b) => b.status !== BookingStatus.CANCELLED)
    .reduce((sum, booking) => sum + booking.amount, 0);
}

/**
 * Filter bookings by parking ID
 */
export function getBookingsByParking(parkingId: string): Booking[] {
  return bookings.filter((b) => b.parkingId === parkingId);
}

/**
 * Filter bookings by date range
 */
export function getBookingsByDateRange(
  startDate: Date,
  endDate: Date
): Booking[] {
  return bookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    return bookingDate >= startDate && bookingDate <= endDate;
  });
}

/**
 * Get date range based on filter option
 */
export function getDateRange(filter: 'today' | 'lastMonth' | 'thisYear' | 'lastYear' | 'all' | 'custom', customStart?: Date, customEnd?: Date): { start: Date; end: Date } | null {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return { start: todayStart, end: todayEnd };
    
    case 'lastMonth':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start: lastMonthStart, end: lastMonthEnd };
    
    case 'thisYear':
      const thisYearStart = new Date(now.getFullYear(), 0, 1);
      const thisYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start: thisYearStart, end: thisYearEnd };
    
    case 'lastYear':
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      return { start: lastYearStart, end: lastYearEnd };
    
    case 'custom':
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd };
      }
      return null;
    
    case 'all':
    default:
      return null;
  }
}

/**
 * Group bookings by date (day-wise)
 */
export function getBookingsByDay(): DailyStats[] {
  const grouped = bookings.reduce((acc, booking) => {
    const date = format(new Date(booking.startTime), "yyyy-MM-dd");

    if (!acc[date]) {
      acc[date] = {
        date,
        bookings: 0,
        earnings: 0,
        cancellations: 0,
      };
    }

    acc[date].bookings++;

    if (booking.status === BookingStatus.CANCELLED) {
      acc[date].cancellations++;
    } else {
      acc[date].earnings += booking.amount;
    }

    return acc;
  }, {} as Record<string, DailyStats>);

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Group bookings by month
 */
export function getBookingsByMonth(): MonthlyStats[] {
  const grouped = bookings.reduce((acc, booking) => {
    const month = format(new Date(booking.startTime), "yyyy-MM");

    if (!acc[month]) {
      acc[month] = {
        month,
        bookings: 0,
        earnings: 0,
        cancellations: 0,
      };
    }

    acc[month].bookings++;

    if (booking.status === BookingStatus.CANCELLED) {
      acc[month].cancellations++;
    } else {
      acc[month].earnings += booking.amount;
    }

    return acc;
  }, {} as Record<string, MonthlyStats>);

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get KPI data for dashboard
 */
export function getKPIData(): KPIData {
  console.log("Getting KPI data, total bookings:", bookings.length);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  const currentMonthBookings = bookings.filter(
    (b) => formatToMonth(b.startTime) === currentMonth
  );
  const lastMonthBookings = bookings.filter(
    (b) => formatToMonth(b.startTime) === lastMonth
  );

  const totalBookings = bookings.length;

  // Calculate total earnings with detailed logging
  let totalEarnings = 0;
  bookings.forEach((b, index) => {
    const amount = parseAmount(b.amount);
    totalEarnings += amount;
    if (index < 3) {
      console.log(`Sample booking ${index}:`, {
        id: b.id,
        amount: b.amount,
        parsed: amount,
      });
    }
  });

  console.log("Total earnings calculated:", totalEarnings);

  const totalCancellations = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  ).length;
  const onAppBookings = bookings.filter(
    (b) => b.bookingType === BookingType.PRE_BOOKED
  ).length;
  const onSiteBookings = bookings.filter(
    (b) => b.bookingType === BookingType.ON_SITE
  ).length;

  const currentEarnings = currentMonthBookings.reduce(
    (sum, b) => sum + parseAmount(b.amount),
    0
  );
  const lastEarnings = lastMonthBookings.reduce(
    (sum, b) => sum + parseAmount(b.amount),
    0
  );

  const bookingsGrowth = lastMonthBookings.length > 0
    ? ((currentMonthBookings.length - lastMonthBookings.length) /
        lastMonthBookings.length) * 100
    : 0;

  const earningsGrowth = lastEarnings > 0
    ? ((currentEarnings - lastEarnings) / lastEarnings) * 100
    : 0;

  return {
    totalBookings,
    totalEarnings: isNaN(totalEarnings) ? 0 : totalEarnings,
    totalCancellations,
    onAppBookings,
    onSiteBookings,
    bookingsGrowth: isNaN(bookingsGrowth) ? 0 : bookingsGrowth,
    earningsGrowth: isNaN(earningsGrowth) ? 0 : earningsGrowth,
  };
}

/**
 * Get parking-wise statistics
 */
export function getParkingWiseStats(parkingId: string): ParkingStats {
  const parkingBookings = bookings.filter((b) => b.parkingId === parkingId);

  const totalBookings = parkingBookings.length;
  const earnings = parkingBookings.reduce((sum, b) => sum + parseAmount(b.amount), 0);
  const cancellations = parkingBookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  ).length;
  const onAppBookings = parkingBookings.filter(
    (b) => b.bookingType === BookingType.PRE_BOOKED
  ).length;
  const onSiteBookings = parkingBookings.filter(
    (b) => b.bookingType === BookingType.ON_SITE
  ).length;

  // Peak hours analysis
  const hourlyData = new Map<number, number>();
  parkingBookings.forEach((booking) => {
    try {
      const startDate =
        typeof booking.startTime === "string"
          ? new Date(booking.startTime)
          : booking.startTime;
      if (startDate && !isNaN(startDate.getTime())) {
        const hour = startDate.getHours();
        hourlyData.set(hour, (hourlyData.get(hour) || 0) + 1);
      }
    } catch (e) {
      console.error("Error processing booking time:", booking.id, e);
    }
  });

  const peakHours = Array.from(hourlyData.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count);

  return {
    parkingId,
    parkingName: "Unknown",
    totalBookings,
    earnings: isNaN(earnings) ? 0 : earnings,
    cancellationRate: totalBookings > 0 ? (cancellations / totalBookings) * 100 : 0,
    peakHours,
    onAppBookings,
    onSiteBookings,
  };
}

/**
 * Get all parking stats
 */
export function getAllParkingStats(startDate?: Date, endDate?: Date): ParkingStats[] {
  let filteredBookings = bookings;
  
  if (startDate && endDate) {
    filteredBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }
  
  return parkings.map((parking) => {
    const parkingBookings = filteredBookings.filter((b) => b.parkingId === parking.id);
    const totalBookings = parkingBookings.length;
    const earnings = parkingBookings.reduce((sum, b) => sum + parseAmount(b.amount), 0);
    const cancellations = parkingBookings.filter(
      (b) => b.status === BookingStatus.CANCELLED
    ).length;
    const onAppBookings = parkingBookings.filter(
      (b) => b.bookingType === BookingType.PRE_BOOKED
    ).length;
    const onSiteBookings = parkingBookings.filter(
      (b) => b.bookingType === BookingType.ON_SITE
    ).length;

    // Calculate peak hours
    const hourCounts: Record<number, number> = {};
    parkingBookings.forEach((booking) => {
      const hour = new Date(booking.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);

    return {
      parkingId: parking.id,
      parkingName: parking.name,
      totalBookings,
      earnings: isNaN(earnings) ? 0 : earnings,
      cancellationRate: totalBookings > 0 ? (cancellations / totalBookings) * 100 : 0,
      peakHours,
      onAppBookings,
      onSiteBookings,
    };
  });
}

/**
 * Get booking type split data for charts
 */
export function getBookingTypeSplit(): { name: string; value: number }[] {
  const onAppCount = bookings.filter(
    (b) => b.bookingType === BookingType.PRE_BOOKED
  ).length;
  const onSiteCount = bookings.filter(
    (b) => b.bookingType === BookingType.ON_SITE
  ).length;

  return [
    { name: "On-App Bookings", value: onAppCount },
    { name: "On-Site Bookings", value: onSiteCount },
  ];
}

/**
 * Get top performing parkings by earnings
 */
export function getTopParkingsByEarnings(limit: number = 5): ParkingStats[] {
  return getAllParkingStats()
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, limit);
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0";
  }
  const rounded = Math.round(amount);
  // Use manual formatting to avoid locale-based hydration issues
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₹${formatted}`;
}

/**
 * Get recent bookings
 */
export function getRecentBookings(limit: number = 10): Booking[] {
  return [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
