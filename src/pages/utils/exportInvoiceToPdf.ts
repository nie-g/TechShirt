import jsPDF from "jspdf";

interface InvoiceBreakdown {
  shirtCount: number;
  printFee: number;
  revisionFee: number;
  designerFee: number;
  total: number;
}

interface ExportInvoiceProps {
  designTitle?: string;
  designDescription?: string;
  invoiceNo: number;
  billingDate: string; // ✅ change from number → string
  breakdown: InvoiceBreakdown;
}

export const exportInvoiceToPDF = ({
  designTitle,
  designDescription,
  invoiceNo,
  billingDate,
  breakdown,
}: ExportInvoiceProps) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // 🧢 Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("TechShirt", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Invoice No. #${String(invoiceNo).padStart(4, "0")}`, margin, y);
  y += 6;
  doc.text(`Date: ${new Date(billingDate).toLocaleDateString()}`, margin, y);
  y += 10;

  // 🧾 Design Info
  doc.setFont("helvetica", "bold");
  doc.text(designTitle || "Custom Design", margin, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  if (designDescription) doc.text(designDescription, margin, y);
  y += 10;

  // 📋 Table Header
  doc.setFont("helvetica", "bold");
  doc.text("Item", margin, y);
  doc.text("Qty", margin + 70, y);
  doc.text("Unit Price", margin + 100, y);
  doc.text("Total", margin + 150, y);
  y += 8;

  // 📦 Table Body
  doc.setFont("helvetica", "normal");
  const items = [
    {
      item: "Printing",
      qty: breakdown.shirtCount,
      unit: breakdown.printFee,
      total: breakdown.printFee * breakdown.shirtCount,
    },
    {
      item: "Revision Fee",
      qty: "-",
      unit: breakdown.revisionFee,
      total: breakdown.revisionFee,
    },
    {
      item: "Designer Fee",
      qty: "-",
      unit: breakdown.designerFee,
      total: breakdown.designerFee,
    },
  ];

  items.forEach((i) => {
    doc.text(i.item, margin, y);
    doc.text(String(i.qty), margin + 70, y);
    doc.text(`₱${i.unit}`, margin + 100, y);
    doc.text(`₱${i.total}`, margin + 170, y, { align: "right" });
    y += 7;
  });

  // 💰 Subtotal
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", margin + 120, y);
  doc.text(`₱${breakdown.total}`, margin + 170, y, { align: "right" });

  // 💰 Tax (12%)
  y += 7;
  const tax = breakdown.total * 0.12;
  doc.text("Tax (12%):", margin + 120, y);
  doc.text(`₱${tax.toFixed(2)}`, margin + 170, y, { align: "right" });

  // 💰 Total
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", margin + 120, y);
  const totalWithTax = breakdown.total * 1.12;
  doc.text(`₱${totalWithTax.toFixed(2)}`, margin + 170, y, { align: "right" });

  // ❤️ Footer
  y += 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text("Thank you for choosing TechShirt!", margin, y);

  // 💾 Save file
  doc.save(`Invoice_${String(invoiceNo).padStart(4, "0")}.pdf`);
};
