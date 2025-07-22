import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// AWS SES Configuration
const AWS_SES_CONFIG = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: 'AKIA3FLD4SRKSIO2IY53',
    pass: 'BPkk/T7c5C3NwlfWXi9lZwZuWOBG5djdY2c+XWhnRrZK'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(AWS_SES_CONFIG);

// Test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ success: true, message: 'AWS SES connection successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from = 'noreply@websparks.ai' } = req.body;

    const mailOptions = {
      from,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send campaign endpoint
app.post('/api/send-campaign', async (req, res) => {
  try {
    const { contacts, subject, template, from = 'noreply@websparks.ai' } = req.body;
    
    const results = [];
    
    for (const contact of contacts) {
      try {
        const personalizedTemplate = template.replace(/{{firstName}}/g, contact.firstName || 'Valued Customer');
        
        const mailOptions = {
          from,
          to: contact.email,
          subject,
          html: personalizedTemplate
        };

        const result = await transporter.sendMail(mailOptions);
        results.push({
          email: contact.email,
          success: true,
          messageId: result.messageId
        });
      } catch (error) {
        results.push({
          email: contact.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Campaign sent: ${successCount} successful, ${failureCount} failed`,
      results,
      stats: { successCount, failureCount, totalSent: contacts.length }
    });
  } catch (error) {
    console.error('Campaign sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
