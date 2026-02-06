// Enums
export enum BookingType {
  PRE_BOOKED = "prebooked",
  ON_SITE = "onsite",
}

export enum BookingStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  ACTIVE = "active",
}

export enum VehicleType {
  TWO_WHEELER = "two_wheeler",
  FOUR_WHEELER = "four_wheeler",
}

// Types
export interface Parking {
  id: string;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: Date;
}

export interface Booking {
  id: string;
  userName: string;
  parkingName: string;
  parkingId: string;
  vehicleNumber: string;
  startTime: string | Date;
  endTime: string | Date;
  amount: number;
  status: BookingStatus;
  bookingType: BookingType;
  vehicleType: VehicleType;
  duration: number; // in hours
  createdAt: Date;
  cancelledAt?: Date;
}

export interface DailyStats {
  date: string;
  bookings: number;
  earnings: number;
  cancellations: number;
}

export interface MonthlyStats {
  month: string;
  bookings: number;
  earnings: number;
  cancellations: number;
}

export interface ParkingStats {
  parkingId: string;
  parkingName: string;
  totalBookings: number;
  earnings: number;
  cancellationRate: number;
  peakHours: { hour: number; count: number }[];
  onAppBookings: number;
  onSiteBookings: number;
}

export interface KPIData {
  totalBookings: number;
  totalCancellations: number;
  onAppBookings: number;
  onSiteBookings: number;
  totalEarnings: number;
  earningsGrowth: number; // percentage
  bookingsGrowth: number; // percentage
}
