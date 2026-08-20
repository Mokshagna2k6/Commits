import { CURRENCIES } from './constants';
import { jsPDF } from 'jspdf';

export const exportQuotePDF = async (items, curIdx, cartWarnings = [], cartRoi = []) => {
  const cur = CURRENCIES[curIdx];
  const fmt = (n) => {
    const val = n * cur.rate;
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency', currency: cur.code, minimumFractionDigits: 0
    }).format(val);
  };

  const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tx = Math.round(sub * (cur.tax / 100));
  const total = sub + tx;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 18;
  const cw = W - M * 2;

  // Header bar
  doc.setFillColor(255, 77, 0); // Fox Orange
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("stackfox", M, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Build & Price Quote", M, 22);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"}), W - M, 22, {align:"right"});

  // Tagline
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("Smart Code, Swift Delivery.", M, 36);

  // Table header
  let y = 44;
  doc.setFillColor(245, 245, 245);
  doc.rect(M, y, cw, 8, "F");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("#", M + 2, y + 5.5);
  doc.text("Service", M + 10, y + 5.5);
  doc.text("Qty", M + cw - 40, y + 5.5, {align:"right"});
  doc.text("Price", M + cw, y + 5.5, {align:"right"});
  y += 10;

  // Items
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  items.forEach((x, i) => {
    if (y > 265) { doc.addPage(); y = 20; }
    // Zebra stripe
    if (i % 2 === 0) { doc.setFillColor(252, 252, 250); doc.rect(M, y - 4, cw, 8, "F"); }
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(String(i + 1), M + 2, y);
    doc.setTextColor(30, 30, 30);
    const name = x.name.length > 50 ? x.name.slice(0, 48) + ".." : x.name;
    doc.text(name, M + 10, y);
    doc.setTextColor(150, 150, 150);
    doc.text(String(x.quantity), M + cw - 40, y, {align:"right"});
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(x.price * x.quantity), M + cw, y, {align:"right"});
    doc.setFont("helvetica", "normal");
    y += 7;
  });

  // Totals
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(M, y, M + cw, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal (" + items.length + " items)", M, y);
  doc.text(fmt(sub), M + cw, y, {align:"right"});
  y += 6;
  doc.text(cur.taxName + " (" + cur.tax + "%)", M, y);
  doc.text(fmt(tx), M + cw, y, {align:"right"});
  y += 8;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(M, y - 3, M + cw, y - 3);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 77, 0); // Fox Orange
  doc.text("Total", M, y + 2);
  doc.text(fmt(total), M + cw, y + 2, {align:"right"});

  // Warnings / ROI
  if (cartWarnings.length > 0 || cartRoi.length > 0) {
    y += 15;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setTextColor(30,30,30);
    doc.text("Analysis & Checklist", M, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(100,100,100);
    [...cartWarnings, ...cartRoi].forEach(msg => {
      const text = msg.msg || (msg.n + ": " + msg.value + " " + msg.metric);
      doc.text("• " + text, M + 2, y);
      y += 5;
    });
  }

  // Footer
  const fy = 282;
  doc.setDrawColor(240, 240, 240);
  doc.line(M, fy - 4, M + cw, fy - 4);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("All prices are indicative and subject to consultation. GST @18% applied where applicable.", M, fy);
  doc.text("stackfox.in  |  hello@stackfox.in  |  +91 98290 00000", M, fy + 4);

  doc.save("StackFox-Quote-" + new Date().toISOString().slice(0, 10) + ".pdf");
};
