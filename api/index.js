const express = require('express');
const cors = require('cors');
const { Resend } = require('resend'); // Importing the API email service

const app = express();

// Initialize Resend with your Secret API Key
const resend = new Resend(process.env.RESEND_API_KEY);
// Middleware configuration
app.use(cors()); 
app.use(express.json());

// ==========================================
// 1. FRONTEND CHECKOUT ROUTE
// ==========================================
app.post('/api/checkout', async (req, res) => {
    const { name, email, phone, table, itemsOrdered, grandTotal } = req.body;

    // Format array objects into a clean, readable text layout for the bill receipt
    let itemsText = itemsOrdered.map(item => `- ${item.name} (Qty: ${item.quantity}) : ₹${item.totalCost}`).join('\n');

    try {
        // Send email using the API client
        const data = await resend.emails.send({
            from: 'Royal Brew House <onboarding@resend.dev>', 
            to: [email], // Sends the bill directly to the customer's entered email
            subject: `☕ Order Confirmation - Table No. ${table}`,
            text: `Hello ${name},\n\nThank you for choosing Royal Brew House! Your order has been registered.\n\n--- Order Summary ---\nTable Number: ${table}\nContact Number: ${phone}\n\nItems Ordered:\n${itemsText}\n\nGrand Total Bill (Inc. Taxes): ₹${grandTotal}\n---------------------\n\nNote: Pay at the counter when you leave.\n\nEnjoy your time with us!`
        });

        console.log('Order processed via API! Email invoice sent successfully:', data);
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('API Email Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}); // ➔ The checkout route ends here


// ==========================================
// 2. 🟢 NEW TABLE RESERVATION ROUTE (ADDED HERE)
// ==========================================
app.post('/api/reservation', async (req, res) => {
    const { name, email, phone, guests, comment } = req.body;

    try {
        // Dispatches the notification copy straight to the customer's input email
        const data = await resend.emails.send({
            from: 'Royal Brew House <onboarding@resend.dev>', // Keep onboarding@resend.dev until your custom domain is attached
            to: [email],
            subject: '🥂 Table Reservation Confirmed - Royal Brew House',
            text: `Hello ${name},\n\nYour table reservation at Royal Brew House has been successfully booked!\n\n--- Reservation Details ---\nGuest Count: ${guests} People\nContact Phone: ${phone}\nSpecial Customizations: ${comment}\n-------------------------\n\nWe look forward to seeing you. If you need to make changes, please contact us directly.\n\nWarm regards,\nManagement Team\nRoyal Brew House`
        });

        console.log('Table Reservation Processed! Confirmation sent to user:', data);
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Reservation Email Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}); // ➔ The reservation route ends here
module.exports = app;
