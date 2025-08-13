const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Thank you for your order! Here are the details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> #${order._id}</p>
            <p><strong>Total:</strong> LKR ${order.total.toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Items Ordered</h3>
            ${order.items.map(item => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <p><strong>${item.name}</strong></p>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: LKR ${item.price.toLocaleString()}</p>
                ${item.selectedColor ? `<p>Color: ${item.selectedColor}</p>` : ''}
                ${item.selectedSize ? `<p>Size: ${item.selectedSize}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          <p>We'll send you updates on your order status. If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>Clothica Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail
};
