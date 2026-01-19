import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export class MailService {
  async sendInvoiceNotification(email: string, invoiceNo: string, amount: number) {
    const mailOptions = {
      from: '"RentCore System" <noreply@rentcore.local>',
      to: email,
      subject: `New Invoice Generated: ${invoiceNo}`,
      html: `
        <h1>RentCore Notification</h1>
        <p>A new invoice has been generated for your lease.</p>
        <p><strong>Invoice No:</strong> ${invoiceNo}</p>
        <p><strong>Total Amount:</strong> ${amount} THB</p>
        <p>Please log in to the system to upload your payment slip.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Invoice notification sent to ${email}`);
    } catch (err) {
      console.error('Failed to send invoice notification:', err);
    }
  }

  async sendPaymentConfirmation(email: string, invoiceNo: string) {
    const mailOptions = {
      from: '"RentCore System" <noreply@rentcore.local>',
      to: email,
      subject: `Payment Confirmed: ${invoiceNo}`,
      html: `
        <h1>RentCore Notification</h1>
        <p>Your payment for invoice ${invoiceNo} has been confirmed.</p>
        <p>Thank you for your payment.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Payment confirmation sent to ${email}`);
    } catch (err) {
      console.error('Failed to send payment confirmation:', err);
    }
  }

  async sendOverdueReminder(email: string, invoiceNo: string, amount: number) {
    const mailOptions = {
      from: '"RentCore System" <noreply@rentcore.local>',
      to: email,
      subject: `Overdue Payment Reminder: ${invoiceNo}`,
      html: `
        <h1>RentCore Overdue Reminder</h1>
        <p>This is a reminder that your payment for invoice ${invoiceNo} is overdue.</p>
        <p><strong>Outstanding Amount:</strong> ${amount} THB</p>
        <p>Please make your payment as soon as possible to avoid additional fees.</p>
        <p>Log in to your account to upload your payment slip.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Overdue reminder sent to ${email} for invoice ${invoiceNo}`);
    } catch (err) {
      console.error('Failed to send overdue reminder:', err);
    }
  }
}
