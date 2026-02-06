import {
  Booking,
  BookingType,
  BookingStatus,
  VehicleType,
} from "@/src/types";

// Helper to create random bookings
const createBooking = (
  id: string,
  parkingId: string,
  parkingName: string,
  userName: string,
  bookingType: BookingType,
  status: BookingStatus,
  vehicleType: VehicleType,
  vehicleNumber: string,
  startTime: Date,
  duration: number
): Booking => {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + duration);

  // Calculate amount based on parking - uniform rate of 35 rupees per hour
  const rates: Record<string, number> = {
    "park-001": 35,
    "park-002": 35,
    "park-003": 35,
    "park-004": 35,
    "park-005": 35,
    "park-006": 35,
  };

  const createdAt = new Date(startTime);
  createdAt.setHours(createdAt.getHours() - (bookingType === BookingType.PRE_BOOKED ? 12 : 0));

  return {
    id,
    parkingId,
    parkingName,
    userName,
    bookingType,
    status,
    vehicleType,
    vehicleNumber,
    startTime,
    endTime,
    duration,
    amount: rates[parkingId] * duration,
    createdAt,
    cancelledAt: status === BookingStatus.CANCELLED ? new Date(startTime.getTime() - 3600000) : undefined,
  };
};

const userNames = [
  "Rahul Sharma", "Priya Patel", "Amit Kumar", "Neha Gupta", "Vikram Singh",
  "Anjali Desai", "Sanjay Mehta", "Kavita Reddy", "Rajesh Verma", "Pooja Joshi",
  "Manoj Nair", "Divya Iyer", "Arjun Kapoor", "Sneha Malhotra", "Karan Shah",
  "Simran Kaur", "Varun Khanna", "Ritu Agarwal", "Deepak Jain", "Meera Rao",
  "Rohit Jain", "Ananya Singh", "Vivek Agarwal", "Priyanka Khanna", "Aryan Mehta"
];

const parkingData = [
  { id: "park-001", name: "Central Plaza Parking" },
  { id: "park-002", name: "Airport Parking Hub" },
  { id: "park-003", name: "Mall Parking Complex" },
  { id: "park-004", name: "Business District Lot" },
  { id: "park-005", name: "Premium Tower Parking" },
  { id: "park-006", name: "Station Parking Area" },
];

export const bookings: Booking[] = [];

// Generate 285 bookings distributed across 5 months (Oct 2025 - Feb 2026) with realistic patterns
let bookingCounter = 1;

// October 2025 (35 bookings - startup phase)
for (let i = 1; i <= 35; i++) {
  const day = Math.min(Math.ceil((i / 35) * 31), 31);
  const hour = 8 + Math.floor(Math.random() * 12); // 8 AM to 8 PM
  const parking = parkingData[Math.floor(Math.random() * 6)]; // Random parking distribution
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const bookingType = Math.random() > 0.35 ? BookingType.PRE_BOOKED : BookingType.ON_SITE; // 65% pre-booked
  const status = Math.random() > 0.12 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED; // 12% cancellation
  const vehicleType = Math.random() > 0.4 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER; // 60% two-wheelers
  const vehicleNumber = `MH${String(Math.floor(Math.random() * 50)).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(1000 + Math.floor(Math.random() * 9000))}`;
  const duration = Math.floor(Math.random() * 4) + 2; // 2-5 hours
  
  bookings.push(
    createBooking(
      `BK-${String(bookingCounter++).padStart(3, '0')}`,
      parking.id,
      parking.name,
      userName,
      bookingType,
      status,
      vehicleType,
      vehicleNumber,
      new Date(`2025-10-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`),
      duration
    )
  );
}

// November 2025 (52 bookings - 49% growth)
for (let i = 1; i <= 52; i++) {
  const day = Math.min(Math.ceil((i / 52) * 30), 30);
  const hour = 7 + Math.floor(Math.random() * 13); // 7 AM to 8 PM
  const parking = parkingData[Math.floor(Math.random() * 6)];
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const bookingType = Math.random() > 0.32 ? BookingType.PRE_BOOKED : BookingType.ON_SITE; // 68% pre-booked
  const status = Math.random() > 0.10 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED; // 10% cancellation
  const vehicleType = Math.random() > 0.38 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER; // 62% two-wheelers
  const vehicleNumber = `MH${String(Math.floor(Math.random() * 50)).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(1000 + Math.floor(Math.random() * 9000))}`;
  const duration = Math.floor(Math.random() * 5) + 2; // 2-6 hours
  
  bookings.push(
    createBooking(
      `BK-${String(bookingCounter++).padStart(3, '0')}`,
      parking.id,
      parking.name,
      userName,
      bookingType,
      status,
      vehicleType,
      vehicleNumber,
      new Date(`2025-11-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`),
      duration
    )
  );
}

// December 2025 (78 bookings - 50% growth, holiday season peak)
for (let i = 1; i <= 78; i++) {
  const day = Math.min(Math.ceil((i / 78) * 31), 31);
  const hour = 7 + Math.floor(Math.random() * 14); // 7 AM to 9 PM (longer hours)
  const parking = parkingData[Math.floor(Math.random() * 6)];
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const bookingType = Math.random() > 0.28 ? BookingType.PRE_BOOKED : BookingType.ON_SITE; // 72% pre-booked
  const status = Math.random() > 0.08 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED; // 8% cancellation
  const vehicleType = Math.random() > 0.35 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER; // 65% two-wheelers
  const vehicleNumber = `MH${String(Math.floor(Math.random() * 50)).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(1000 + Math.floor(Math.random() * 9000))}`;
  const duration = Math.floor(Math.random() * 6) + 2; // 2-7 hours (longer stays in holiday)
  
  bookings.push(
    createBooking(
      `BK-${String(bookingCounter++).padStart(3, '0')}`,
      parking.id,
      parking.name,
      userName,
      bookingType,
      status,
      vehicleType,
      vehicleNumber,
      new Date(`2025-12-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`),
      duration
    )
  );
}

// January 2026 (95 bookings - 22% growth, new year momentum)
for (let i = 1; i <= 95; i++) {
  const day = Math.min(Math.ceil((i / 95) * 31), 31);
  const hour = 7 + Math.floor(Math.random() * 13); // 7 AM to 8 PM
  const parking = parkingData[Math.floor(Math.random() * 6)];
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const bookingType = Math.random() > 0.25 ? BookingType.PRE_BOOKED : BookingType.ON_SITE; // 75% pre-booked
  const status = Math.random() > 0.09 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED; // 9% cancellation
  const vehicleType = Math.random() > 0.37 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER; // 63% two-wheelers
  const vehicleNumber = `MH${String(Math.floor(Math.random() * 50)).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(1000 + Math.floor(Math.random() * 9000))}`;
  const duration = Math.floor(Math.random() * 5) + 2; // 2-6 hours
  
  bookings.push(
    createBooking(
      `BK-${String(bookingCounter++).padStart(3, '0')}`,
      parking.id,
      parking.name,
      userName,
      bookingType,
      status,
      vehicleType,
      vehicleNumber,
      new Date(`2026-01-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`),
      duration
    )
  );
}

// February 2026 (25 bookings - up to current date, 33% growth trajectory)
for (let i = 1; i <= 25; i++) {
  const day = Math.min(i <= 6 ? i : 6, 6);
  const hour = 8 + Math.floor(Math.random() * 11); // 8 AM to 7 PM
  const parking = parkingData[Math.floor(Math.random() * 6)];
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const bookingType = Math.random() > 0.23 ? BookingType.PRE_BOOKED : BookingType.ON_SITE; // 77% pre-booked
  const status = i > 22 ? BookingStatus.ACTIVE : i > 20 ? BookingStatus.CONFIRMED : Math.random() > 0.07 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED; // 7% cancellation, some active
  const vehicleType = Math.random() > 0.36 ? VehicleType.TWO_WHEELER : VehicleType.FOUR_WHEELER; // 64% two-wheelers
  const vehicleNumber = `MH${String(Math.floor(Math.random() * 50)).padStart(2, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String(1000 + Math.floor(Math.random() * 9000))}`;
  const duration = Math.floor(Math.random() * 5) + 2; // 2-6 hours
  
  bookings.push(
    createBooking(
      `BK-${String(bookingCounter++).padStart(3, '0')}`,
      parking.id,
      parking.name,
      userName,
      bookingType,
      status,
      vehicleType,
      vehicleNumber,
      new Date(`2026-02-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`),
      duration
    )
  );
}
