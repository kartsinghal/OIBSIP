import nodemailer from 'nodemailer';

/**
 * Reusable mail transporter.
 * Set EMAIL_USER, EMAIL_PASS, ADMIN_EMAIL in backend/.env
 * Uses Gmail SMTP (enable App Password if 2FA is on).
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null; // email not configured — silently skip
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a low-stock alert email to ADMIN_EMAIL.
 * @param {Array<{ingredientName, quantity, threshold}>} lowItems
 */
export const sendLowStockAlert = async (lowItems) => {
  const transporter = createTransporter();
  if (!transporter || !process.env.ADMIN_EMAIL || lowItems.length === 0) return;

  const rows = lowItems
    .map(item => {
      const status = item.quantity <= 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK';
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.ingredientName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.quantity} ${item.unit || ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.threshold} ${item.unit || ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;">${status}</td>
        </tr>`;
    })
    .join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;">
      <div style="background:#FF4500;padding:24px;border-radius:12px 12px 0 0;">
        <h2 style="color:#fff;margin:0;">🍕 Inferno Pizza — Low Stock Alert</h2>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#333;">The following ingredients are running low or out of stock:</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr style="background:#f9f9f9;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888;">Ingredient</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888;">Current Stock</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888;">Threshold</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#888;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px;">Please restock immediately to avoid order failures.</p>
      </div>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"Inferno Pizza" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Low Stock Alert - Inferno Pizza',
      html,
    });
    console.log(`[Mail] Low stock alert sent for: ${lowItems.map(i => i.ingredientName).join(', ')}`);
  } catch (err) {
    // Never crash the app because of email failures
    console.error('[Mail] Failed to send low stock alert:', err.message);
  }
};
