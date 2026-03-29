import jsPDF from 'jspdf';
import { Order } from '../types';
import { formatPrice } from './formatters';

export const generateOrderReceipt = (order: Order) => {
  // Thermal receipt style: 80mm width, dynamic height
  const width = 80;
  const height = 150 + (order.items.length * 15); // Adjust height based on items
  const doc = new jsPDF({
    unit: 'mm',
    format: [width, height]
  });

  const pageWidth = doc.internal.pageSize.width;
  const margin = 5;
  let currentY = 10;

  const drawDashedLine = (y: number) => {
    (doc as any).setLineDash([1, 1], 0);
    doc.setDrawColor(150);
    doc.line(margin, y, pageWidth - margin, y);
    (doc as any).setLineDash([], 0);
  };

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text('BUS STORE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  drawDashedLine(currentY);
  currentY += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('*** REÇU ***', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`CAISSE #1`, margin, currentY);
  const dateStr = order.createdAt.toLocaleDateString('fr-FR');
  const timeStr = order.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  doc.text(`${dateStr} - ${timeStr}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  drawDashedLine(currentY);
  currentY += 8;

  doc.setFontSize(8);
  order.items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.text(item.name.toUpperCase(), margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatPrice(item.price * item.quantity)} DH`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 4;
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(`x${item.quantity} à ${formatPrice(item.price)} DH`, margin + 2, currentY);
    doc.setTextColor(0);
    doc.setFontSize(8);
    currentY += 6;
  });

  currentY += 2;
  drawDashedLine(currentY);
  currentY += 8;

  doc.setFontSize(8);
  doc.text('SOUS-TOTAL', margin, currentY);
  doc.text(`${formatPrice(order.total + (order.discount || 0))} DH`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  if (order.discount) {
    doc.text(`REMISE (${order.promoCode || 'PROMO'})`, margin, currentY);
    doc.text(`-${formatPrice(order.discount)} DH`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 5;
  }

  doc.text('FIDÉLITÉ', margin, currentY);
  doc.text('-0.00 DH', pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  drawDashedLine(currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', margin, currentY);
  doc.text(`${formatPrice(order.total)} DH`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('PAIEMENT', margin, currentY);
  doc.text(`${formatPrice(order.total)} DH`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 5;

  doc.text('MONNAIE', margin, currentY);
  doc.text('0.00 DH', pageWidth - margin, currentY, { align: 'right' });
  currentY += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('MERCI POUR VOTRE ACHAT !', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  drawDashedLine(currentY);
  currentY += 10;

  // Barcode Simulation
  const barcodeWidth = 40;
  const barcodeHeight = 8;
  const barcodeX = (pageWidth - barcodeWidth) / 2;
  
  // Draw random lines for barcode effect
  for (let i = 0; i < barcodeWidth; i += 0.8) {
    const lineWidth = Math.random() > 0.5 ? 0.4 : 0.2;
    doc.setDrawColor(0);
    doc.setLineWidth(lineWidth);
    doc.line(barcodeX + i, currentY, barcodeX + i, currentY + barcodeHeight);
  }

  // Save PDF
  doc.save(`recu-commande-${order.id.substring(0, 8)}.pdf`);
};
