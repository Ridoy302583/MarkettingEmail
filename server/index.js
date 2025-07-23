import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3001;
const server = createServer(app);
const wss = new WebSocketServer({ server });

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
// WebSocket connection handling
const activeConnections = new Set();
const emailJobs = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  activeConnections.add(ws);
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    activeConnections.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    activeConnections.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  activeConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// Bulk email sending with real-time monitoring
app.post('/api/send-bulk-campaign', async (req, res) => {
  try {
    const { jobId, contacts, subject, html, from = 'noreply@websparks.ai', batchSize = 50, delayBetweenBatches = 500 } = req.body;
    
    if (!jobId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: jobId and contacts array are required'
      });
    }

    const totalBatches = Math.ceil(contacts.length / batchSize);

    // Initialize job tracking
    const job = {
      id: jobId,
      totalEmails: contacts.length,
      sent: 0,
      success: 0,
      failed: 0,
      pending: contacts.length,
      status: 'running',
      startTime: new Date(),
      totalBatches,
      currentBatch: 0,
      errors: []
    };
    
    emailJobs.set(jobId, job);
    
    // Send initial job status - MATCH FRONTEND EXPECTATIONS
    broadcast({
      type: 'job_started',
      jobId,
      job: {
        totalEmails: contacts.length,
        startTime: job.startTime.toISOString(),
        totalBatches
      }
    });

    // Process emails in batches
    const processBatch = async (batch, batchIndex) => {
      // Update current batch
      job.currentBatch = batchIndex + 1;
      
      // Send batch started message
      broadcast({
        type: 'batch_started',
        jobId,
        batch: {
          id: `batch_${batchIndex + 1}`,
          number: batchIndex + 1,
          emails: batch.map(contact => contact.email)
        }
      });

      // Send next batch preview if exists
      if (batchIndex + 1 < totalBatches) {
        const nextBatchStart = (batchIndex + 1) * batchSize;
        const nextBatch = contacts.slice(nextBatchStart, nextBatchStart + batchSize);
        broadcast({
          type: 'batch_queued',
          jobId,
          batch: {
            id: `batch_${batchIndex + 2}`,
            number: batchIndex + 2,
            emails: nextBatch.map(contact => contact.email)
          }
        });
      }

      const batchPromises = batch.map(async (contact) => {
        try {
          // Send individual email sending notification
          broadcast({
            type: 'email_sending',
            jobId,
            email: contact.email,
            timestamp: new Date().toISOString()
          });

          const personalizedHtml = html.replace(/{{firstName}}/g, contact.firstName || 'Valued Customer');
          
          const mailOptions = {
            from,
            to: contact.email,
            subject,
            html: personalizedHtml
          };

          const result = await transporter.sendMail(mailOptions);
          
          // Update job stats
          job.sent++;
          job.success++;
          job.pending--;
          
          // Broadcast success update
          broadcast({
            type: 'email_sent',
            jobId,
            email: contact.email,
            status: 'sent',
            messageId: result.messageId,
            timestamp: new Date().toISOString(),
            progress: {
              sent: job.sent,
              success: job.success,
              failed: job.failed,
              pending: job.pending,
              rate: Math.floor(job.sent / ((new Date() - job.startTime) / 1000)) || 0
            }
          });
          
          return {
            email: contact.email,
            success: true,
            messageId: result.messageId
          };
        } catch (error) {
          // Update job stats
          job.sent++;
          job.failed++;
          job.pending--;
          job.errors.push({
            email: contact.email,
            error: error.message,
            timestamp: new Date()
          });
          
          // Broadcast error update
          broadcast({
            type: 'email_failed',
            jobId,
            email: contact.email,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            progress: {
              sent: job.sent,
              success: job.success,
              failed: job.failed,
              pending: job.pending,
              rate: Math.floor(job.sent / ((new Date() - job.startTime) / 1000)) || 0
            }
          });
          
          return {
            email: contact.email,
            success: false,
            error: error.message
          };
        }
      });
      
      return Promise.all(batchPromises);
    };

    // Process all batches
    const results = [];
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}`);
      
      const batchResults = await processBatch(batch, batchIndex);
      results.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i + batchSize < contacts.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // Mark job as completed
    job.status = 'completed';
    job.endTime = new Date();
    emailJobs.set(jobId, job);
    
    // Send completion notification
    broadcast({
      type: 'job_completed',
      jobId,
      results: {
        total: contacts.length,
        successful: job.success,
        failed: job.failed
      }
    });

    res.json({
      success: true,
      message: `Bulk campaign completed: ${job.success} successful, ${job.failed} failed`,
      jobId,
      results: {
        total: contacts.length,
        successful: job.success,
        failed: job.failed,
        details: results
      }
    });
  } catch (error) {
    console.error('Bulk campaign error:', error);
    
    // Update job status to failed
    if (req.body.jobId && emailJobs.has(req.body.jobId)) {
      const job = emailJobs.get(req.body.jobId);
      job.status = 'failed';
      job.endTime = new Date();
      emailJobs.set(req.body.jobId, job);
      
      broadcast({
        type: 'job_failed',
        jobId: req.body.jobId,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get job status
app.get('/api/job-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = emailJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  res.json({
    success: true,
    job
  });
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(emailJobs.values());
  res.json({
    success: true,
    jobs
  });
});
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

server.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
});
