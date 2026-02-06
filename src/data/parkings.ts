import { Parking } from "@/src/types";

export const parkings: Parking[] = [
  {
    id: "park-001",
    name: "Dadar Station Parking",
    location: "Dadar East, Mumbai",
    capacity: 150,
    pricePerHour: 35,
    coordinates: { lat: 19.0183, lng: 72.8478 },
  },
  {
    id: "park-002",
    name: "CST Metro Parking",
    location: "Chhatrapati Shivaji Terminus, Mumbai",
    capacity: 200,
    pricePerHour: 35,
    coordinates: { lat: 18.9398, lng: 72.8355 },
  },
  {
    id: "park-003",
    name: "Bandra West Parking",
    location: "Bandra West, Mumbai",
    capacity: 120,
    pricePerHour: 35,
    coordinates: { lat: 19.0596, lng: 72.8295 },
  },
  {
    id: "park-004",
    name: "Andheri East Hub",
    location: "Andheri East, Mumbai",
    capacity: 180,
    pricePerHour: 35,
    coordinates: { lat: 19.1136, lng: 72.8697 },
  },
  {
    id: "park-005",
    name: "Lower Parel Complex",
    location: "Lower Parel, Mumbai",
    capacity: 250,
    pricePerHour: 35,
    coordinates: { lat: 18.9975, lng: 72.8308 },
  },
  {
    id: "park-006",
    name: "Powai IT Park",
    location: "Powai, Mumbai",
    capacity: 300,
    pricePerHour: 35,
    coordinates: { lat: 19.1176, lng: 72.9060 },
  },
];
