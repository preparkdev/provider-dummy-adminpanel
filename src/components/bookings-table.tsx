"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Booking, BookingStatus } from "@/src/types";
import { formatCurrency } from "@/src/lib/analytics";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingsTableProps {
  bookings: Booking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings = bookings.slice(startIndex, endIndex);

  // Reset to page 1 when bookings change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, "default" | "success" | "secondary" | "destructive"> = {
      [BookingStatus.CONFIRMED]: "default",
      [BookingStatus.ACTIVE]: "success",
      [BookingStatus.COMPLETED]: "secondary",
      [BookingStatus.CANCELLED]: "destructive",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Car Number</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              currentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell className="font-mono font-semibold">{booking.vehicleNumber}</TableCell>
                  <TableCell>{booking.userName}</TableCell>
                  <TableCell>{booking.parkingName}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startTime), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{formatCurrency(typeof booking.amount === 'string' ? parseFloat(booking.amount) : booking.amount)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>{/* ...existing code... */}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, bookings.length)} of {bookings.length} bookings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
