import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { bookings } from '@/src/data/bookings';
import { parkings } from '@/src/data/parkings';
import { BookingStatus, BookingType } from '@/src/types';

export interface ReportData {
  dateFilter: string;
  totalBookings: number;
  totalEarnings: number;
  totalCancellations: number;
  onAppBookings: number;
  onSiteBookings: number;
  bookingsGrowth: number;
  earningsGrowth: number;
  dateRange?: { start: Date; end: Date } | null;
}

export async function generateAnalyticsReport(
  reportData: ReportData
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFillColor(16, 185, 129); // emerald-500
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PrePark Analytics Report', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const dateText = getDateFilterText(reportData.dateFilter);
  pdf.text(`Period: ${dateText}`, pageWidth / 2, 30, { align: 'center' });
  pdf.text(`Generated: ${format(new Date(), 'PPP p')}`, pageWidth / 2, 36, { align: 'center' });

  // Reset text color for content
  pdf.setTextColor(0, 0, 0);
  yPosition = 50;

  // KPI Summary Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Performance Indicators', 15, yPosition);
  yPosition += 10;

  // KPI Cards
  const kpiData = [
    { label: 'Total Bookings', value: reportData.totalBookings.toString(), growth: reportData.bookingsGrowth },
    { label: 'Total Revenue', value: `₹${(reportData.totalEarnings / 1000).toFixed(1)}k`, growth: reportData.earningsGrowth },
    { label: 'Cancellations', value: reportData.totalCancellations.toString(), growth: null },
    { label: 'On-App Bookings', value: reportData.onAppBookings.toString(), growth: null },
    { label: 'On-Site Bookings', value: reportData.onSiteBookings.toString(), growth: null },
  ];

  kpiData.forEach((kpi, index) => {
    const x = 15 + (index % 2) * 95;
    const y = yPosition + Math.floor(index / 2) * 35;
    
    // KPI box
    pdf.setFillColor(249, 250, 251); // gray-50
    pdf.roundedRect(x, y, 85, 30, 2, 2, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128); // gray-500
    pdf.text(kpi.label, x + 5, y + 8);
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39); // gray-900
    pdf.text(kpi.value, x + 5, y + 18);
    
    // Growth indicator
    if (kpi.growth !== null && kpi.growth !== 0) {
      const isPositive = kpi.growth > 0;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(isPositive ? 16 : 239, isPositive ? 185 : 68, isPositive ? 129 : 68);
      const growthText = `${isPositive ? '↑' : '↓'} ${Math.abs(kpi.growth).toFixed(1)}%`;
      pdf.text(growthText, x + 5, y + 25);
    }
  });

  yPosition += Math.ceil(kpiData.length / 2) * 35 + 15;

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Filter bookings for the report period
  const filteredBookings = reportData.dateRange 
    ? bookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        return bookingDate >= reportData.dateRange!.start && bookingDate <= reportData.dateRange!.end;
      })
    : bookings;

  // Parking-wise Performance Table
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Parking Location Performance', 15, yPosition);
  yPosition += 8;

  // Table header
  pdf.setFillColor(16, 185, 129);
  pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('Location', 18, yPosition + 5.5);
  pdf.text('Bookings', 80, yPosition + 5.5);
  pdf.text('Revenue', 115, yPosition + 5.5);
  pdf.text('Cancel %', 150, yPosition + 5.5);
  pdf.text('Avg/Day', 175, yPosition + 5.5);
  yPosition += 8;

  // Table rows
  parkings.forEach((parking, index) => {
    const parkingBookings = filteredBookings.filter(b => b.parkingId === parking.id);
    const totalBookings = parkingBookings.length;
    const revenue = parkingBookings
      .filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((sum, b) => sum + b.amount, 0);
    const cancelled = parkingBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    const cancelRate = totalBookings > 0 ? (cancelled / totalBookings) * 100 : 0;
    const daysInPeriod = reportData.dateRange 
      ? Math.ceil((reportData.dateRange.end.getTime() - reportData.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    const avgPerDay = totalBookings / Math.max(daysInPeriod, 1);

    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, yPosition, pageWidth - 30, 7, 'F');
    }

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(parking.name.substring(0, 25), 18, yPosition + 4.5);
    pdf.text(totalBookings.toString(), 80, yPosition + 4.5);
    pdf.text(`₹${Math.round(revenue).toLocaleString()}`, 115, yPosition + 4.5);
    pdf.text(`${cancelRate.toFixed(1)}%`, 150, yPosition + 4.5);
    pdf.text(avgPerDay.toFixed(1), 175, yPosition + 4.5);
    yPosition += 7;

    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
  });

  yPosition += 10;

  // Booking Type Analysis
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Booking Type Analysis', 15, yPosition);
  yPosition += 8;

  const onAppBookings = filteredBookings.filter(b => b.bookingType === BookingType.PRE_BOOKED);
  const onSiteBookings = filteredBookings.filter(b => b.bookingType === BookingType.ON_SITE);
  const onAppRevenue = onAppBookings.filter(b => b.status !== BookingStatus.CANCELLED).reduce((sum, b) => sum + b.amount, 0);
  const onSiteRevenue = onSiteBookings.filter(b => b.status !== BookingStatus.CANCELLED).reduce((sum, b) => sum + b.amount, 0);

  const analysisData = [
    ['Booking Type', 'Count', 'Revenue', 'Avg Value', 'Cancel Rate'],
    [
      'On-App (Pre-booked)',
      onAppBookings.length.toString(),
      `₹${Math.round(onAppRevenue).toLocaleString()}`,
      `₹${Math.round(onAppRevenue / Math.max(onAppBookings.length, 1))}`,
      `${((onAppBookings.filter(b => b.status === BookingStatus.CANCELLED).length / Math.max(onAppBookings.length, 1)) * 100).toFixed(1)}%`
    ],
    [
      'On-Site (Walk-in)',
      onSiteBookings.length.toString(),
      `₹${Math.round(onSiteRevenue).toLocaleString()}`,
      `₹${Math.round(onSiteRevenue / Math.max(onSiteBookings.length, 1))}`,
      `${((onSiteBookings.filter(b => b.status === BookingStatus.CANCELLED).length / Math.max(onSiteBookings.length, 1)) * 100).toFixed(1)}%`
    ]
  ];

  // Draw table
  analysisData.forEach((row, rowIndex) => {
    if (rowIndex === 0) {
      pdf.setFillColor(16, 185, 129);
      pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
    } else {
      if (rowIndex % 2 === 1) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(15, yPosition, pageWidth - 30, 7, 'F');
      }
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(17, 24, 39);
    }

    pdf.text(row[0], 18, yPosition + (rowIndex === 0 ? 5.5 : 4.5));
    pdf.text(row[1], 75, yPosition + (rowIndex === 0 ? 5.5 : 4.5));
    pdf.text(row[2], 105, yPosition + (rowIndex === 0 ? 5.5 : 4.5));
    pdf.text(row[3], 140, yPosition + (rowIndex === 0 ? 5.5 : 4.5));
    pdf.text(row[4], 170, yPosition + (rowIndex === 0 ? 5.5 : 4.5));
    yPosition += rowIndex === 0 ? 8 : 7;
  });

  yPosition += 10;

  // Status Breakdown
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Booking Status Breakdown', 15, yPosition);
  yPosition += 8;

  const statusCounts = {
    [BookingStatus.CONFIRMED]: filteredBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
    [BookingStatus.ACTIVE]: filteredBookings.filter(b => b.status === BookingStatus.ACTIVE).length,
    [BookingStatus.COMPLETED]: filteredBookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    [BookingStatus.CANCELLED]: filteredBookings.filter(b => b.status === BookingStatus.CANCELLED).length,
  };

  Object.entries(statusCounts).forEach(([status, count], index) => {
    const percentage = (count / Math.max(filteredBookings.length, 1)) * 100;
    
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, yPosition, pageWidth - 30, 7, 'F');
    }

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(status.charAt(0) + status.slice(1).toLowerCase(), 18, yPosition + 4.5);
    pdf.text(count.toString(), 100, yPosition + 4.5);
    pdf.text(`${percentage.toFixed(1)}%`, 150, yPosition + 4.5);
    
    // Progress bar
    const barWidth = 40;
    const filledWidth = (percentage / 100) * barWidth;
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(165, yPosition + 1, barWidth, 4);
    pdf.setFillColor(16, 185, 129);
    pdf.rect(165, yPosition + 1, filledWidth, 4, 'F');
    
    yPosition += 7;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text(
      '© PrePark Provider Admin',
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `PrePark_Analytics_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.pdf`;
  pdf.save(fileName);
}

function getDateFilterText(filter: string): string {
  switch (filter) {
    case 'today':
      return 'Today';
    case 'lastMonth':
      return 'Last Month';
    case 'thisYear':
      return 'This Year';
    case 'lastYear':
      return 'Last Year';
    default:
      return 'All Time';
  }
}
