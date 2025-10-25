const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'noreply@yourstore.com',
      subject,
      html,
    };
    
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Our Store!',
    html: `
      <h2>Welcome to Our Store, ${name}!</h2>
      <p>Thank you for joining us. Start shopping now!</p>
      <a href="${process.env.CLIENT_URL}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Start Shopping</a>
    `
  }),
  orderConfirmation: (orderId, items, total) => ({
    subject: `Order Confirmation #${orderId}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order #${orderId} has been received.</p>
      <h3>Order Summary:</h3>
      <ul>
        ${items.map(item => `
          <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
        `).join('')}
      </ul>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
      <p>We'll notify you once your order ships.</p>
    `
  })
};

module.exports = { sendEmail, emailTemplates };
