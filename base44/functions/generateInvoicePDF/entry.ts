import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id is required' }, { status: 400 });
    }

    console.log(`Generating invoice PDF for booking: ${booking_id}`);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    const booking = bookings?.[0];
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const [serviceArr, propertyArr, customerArr] = await Promise.all([
      base44.asServiceRole.entities.Service.filter({ id: booking.service_id }),
      base44.asServiceRole.entities.Property.filter({ id: booking.property_id }),
      base44.asServiceRole.entities.User.filter({ id: booking.customer_id }),
    ]);

    const service = serviceArr?.[0] || {};
    const property = propertyArr?.[0] || {};
    const customer = customerArr?.[0] || {};

    let provider = null;
    if (booking.assigned_provider_id) {
      const provArr = await base44.asServiceRole.entities.Provider.filter({ id: booking.assigned_provider_id });
      provider = provArr?.[0] || null;
    }

    // Labor hours
    let laborHours = 0;
    let laborDisplay = 'N/A';
    if (booking.started_at && booking.completed_at) {
      const diffMs = new Date(booking.completed_at) - new Date(booking.started_at);
      laborHours = Math.max(0, diffMs / (1000 * 60 * 60));
      laborDisplay = `${laborHours.toFixed(1)} hrs`;
    } else if (service.duration_minutes) {
      laborHours = service.duration_minutes / 60;
      laborDisplay = `${laborHours.toFixed(1)} hrs (estimated)`;
    }

    // Pricing
    const servicePrice = service.price || booking.total_amount || 0;
    const addonsAmount = booking.addons_amount || 0;
    const subtotal = servicePrice + addonsAmount;
    const vatRate = 0.05;
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    const invoiceNumber = `INV-${booking_id.substring(0, 8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' });
    const serviceDate = booking.scheduled_date
      ? new Date(booking.scheduled_date).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A';

    // ─── Build PDF ─────────────────────────────────────────────────────────
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 18;
    const colRight = 130;

    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, pageW, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INAYA Facilities Management', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('28th Street, Belhasa HO Building, Hor Al Anz East, Dubai, UAE', margin, 26);
    doc.text('+971 4 815 7300  |  info@inaya.ae  |  www.inaya.ae', margin, 32);

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageW - margin, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, pageW - margin, 28, { align: 'right' });
    doc.text(`Date: ${invoiceDate}`, pageW - margin, 34, { align: 'right' });

    doc.setTextColor(30, 30, 30);

    let y = 55;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, 82, 38, 2, 2, 'F');
    doc.roundedRect(colRight, y, 62, 38, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text('BILL TO', margin + 4, y + 7);
    doc.text('JOB DETAILS', colRight + 4, y + 7);

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(customer.full_name || 'Customer', margin + 4, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(customer.email || '', margin + 4, y + 22);
    const addr = property.address ? doc.splitTextToSize(`${property.address}${property.area ? ', ' + property.area : ''}`, 74) : [];
    doc.text(addr, margin + 4, y + 29);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Date:', colRight + 4, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(serviceDate, colRight + 4, y + 21);
    doc.setFont('helvetica', 'bold');
    doc.text('Time Slot:', colRight + 4, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(booking.scheduled_time || 'N/A', colRight + 4, y + 34);

    y += 46;
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageW - margin * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 3, y + 6);
    doc.text('QTY / HRS', 120, y + 6, { align: 'right' });
    doc.text('UNIT PRICE', 150, y + 6, { align: 'right' });
    doc.text('AMOUNT', pageW - margin - 2, y + 6, { align: 'right' });

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const rows = [
      {
        desc: service.name || 'Service',
        sub: provider ? `Technician: ${provider.full_name}` : '',
        qty: laborDisplay,
        unit: `AED ${servicePrice.toFixed(2)}`,
        amount: `AED ${servicePrice.toFixed(2)}`,
      },
    ];

    if (addonsAmount > 0) {
      rows.push({ desc: 'Add-on Services', sub: '', qty: '—', unit: `AED ${addonsAmount.toFixed(2)}`, amount: `AED ${addonsAmount.toFixed(2)}` });
    }

    rows.forEach((row, i) => {
      y += 11;
      if (i % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 4, pageW - margin * 2, 12, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.text(row.desc, margin + 3, y + 2);
      if (row.sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(row.sub, margin + 3, y + 7);
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(9);
      }
      doc.setFont('helvetica', 'normal');
      doc.text(row.qty, 120, y + 2, { align: 'right' });
      doc.text(row.unit, 150, y + 2, { align: 'right' });
      doc.text(row.amount, pageW - margin - 2, y + 2, { align: 'right' });
    });

    y += 18;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);

    const totalsX = 140;
    const amtX = pageW - margin - 2;

    const addTotalRow = (label, value, bold = false, highlight = false) => {
      y += 8;
      if (highlight) {
        doc.setFillColor(240, 253, 244);
        doc.rect(totalsX - 4, y - 5, pageW - margin - totalsX + 6, 10, 'F');
      }
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 10 : 9);
      doc.setTextColor(bold && highlight ? 5 : 80, bold && highlight ? 150 : 80, bold && highlight ? 105 : 80);
      doc.text(label, totalsX, y);
      doc.setTextColor(bold ? 10 : 60, bold ? 10 : 60, bold ? 10 : 60);
      doc.text(value, amtX, y, { align: 'right' });
    };

    addTotalRow('Subtotal', `AED ${subtotal.toFixed(2)}`);
    addTotalRow('VAT (5%)', `AED ${vatAmount.toFixed(2)}`);
    addTotalRow('TOTAL DUE', `AED ${totalAmount.toFixed(2)}`, true, true);

    y += 14;
    const isPaid = booking.payment_status === 'paid';
    doc.setFillColor(isPaid ? 209 : 254, isPaid ? 250 : 243, isPaid ? 229 : 199);
    doc.roundedRect(margin, y, 50, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPaid ? 5 : 180, isPaid ? 150 : 70, isPaid ? 105 : 0);
    doc.text(isPaid ? '✓ PAID' : 'PAYMENT PENDING', margin + 4, y + 7);

    if (booking.provider_notes || booking.customer_notes) {
      y += 16;
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, y, pageW - margin * 2, 20, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      doc.text('NOTES', margin + 4, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const notes = booking.provider_notes || booking.customer_notes || '';
      const noteLines = doc.splitTextToSize(notes, pageW - margin * 2 - 8);
      doc.text(noteLines, margin + 4, y + 14);
    }

    const footerY = 275;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, footerY, pageW, 22, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('INAYA Facilities Management Services L.L.C. | TRN: 100123456789', pageW / 2, footerY + 7, { align: 'center' });
    doc.text('Thank you for choosing INAYA. For queries: +971 4 815 7300 | info@inaya.ae', pageW / 2, footerY + 13, { align: 'center' });
    doc.text(`Invoice ${invoiceNumber} | Generated: ${invoiceDate}`, pageW / 2, footerY + 19, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    // ─── Save Invoice record ─────────────────────────────────────────────────
    const existingInvoices = await base44.asServiceRole.entities.Invoice.filter({ booking_id });
    if (existingInvoices.length === 0) {
      await base44.asServiceRole.entities.Invoice.create({
        invoice_number: invoiceNumber,
        customer_id: booking.customer_id,
        booking_id,
        invoice_date: new Date().toISOString().split('T')[0],
        amount: subtotal,
        tax_amount: vatAmount,
        total_amount: totalAmount,
        status: booking.payment_status === 'paid' ? 'paid' : 'pending',
        line_items: rows.map(r => ({ description: r.desc, quantity: 1, unit_price: servicePrice, amount: servicePrice })),
      });
      console.log(`Invoice record created: ${invoiceNumber}`);
    }

    // ─── Email invoice using template ────────────────────────────────────────
    if (customer?.email) {
      const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ template_key: 'invoice_sent' });
      const template = templates?.[0];

      if (template && template.is_active !== false) {
        let subject = template.subject || `Invoice ${invoiceNumber} — ${service.name} Completed`;
        let body = template.body || '';
        const vars = {
          customer_name: customer.full_name,
          customer_email: customer.email,
          invoice_number: invoiceNumber,
          total_amount: totalAmount.toFixed(2),
          due_date: new Date().toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' }),
          company_name: 'INAYA Facilities Management',
        };
        for (const [key, val] of Object.entries(vars)) {
          const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          subject = subject.replace(re, val ?? '');
          body = body.replace(re, val ?? '');
        }
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject,
          body,
          from_name: 'INAYA Facilities Management',
        });
        console.log(`Invoice email sent to ${customer.email} using template`);
      } else {
        // Fallback plain email if template not found
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: customer.email,
          subject: `Invoice ${invoiceNumber} — ${service.name} Completed`,
          body: `<p>Dear ${customer.full_name},</p><p>Your service <strong>${service.name}</strong> has been completed. Invoice <strong>${invoiceNumber}</strong> — Total: AED ${totalAmount.toFixed(2)}.</p><p>INAYA Facilities Management</p>`,
          from_name: 'INAYA Facilities Management',
        });
        console.log(`Invoice fallback email sent to ${customer.email}`);
      }
    }

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoiceNumber}.pdf`,
      },
    });

  } catch (error) {
    console.error('generateInvoicePDF error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});