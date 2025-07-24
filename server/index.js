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

// Default sender configuration - UPDATED FOR WEBSPARKS
const DEFAULT_FROM_NAME = "Allmamun from Websparks";
const DEFAULT_FROM_EMAIL = "allmamun@websparks.ai";
const DEFAULT_FROM = `"${DEFAULT_FROM_NAME}" <${DEFAULT_FROM_EMAIL}>`;

// SES Rate Limiting Configuration
const SES_RATE_LIMIT = 14; // emails per second
const DEFAULT_BATCH_SIZE = 10; // Reduced batch size for SES limits
const DELAY_BETWEEN_EMAILS = 80; // 80ms between emails (12.5 emails/second)
const DELAY_BETWEEN_BATCHES = 1000; // 1 second between batches
const MAX_RETRIES = 3; // Maximum retry attempts for failed emails

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

// Function to format display name with email - UPDATED
function formatFromAddress(name = DEFAULT_FROM_NAME, email = DEFAULT_FROM_EMAIL) {
  return `"${name}" <${email}>`;
}

// Specific function for WebSparks emails
function formatWebSparksFromAddress() {
  return `"Allmamun from Websparks" <allmamun@websparks.ai>`;
}

// Sleep function for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retryEmailSend(mailOptions, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${mailOptions.to} (attempt ${attempt})`);
      return { success: true, result };
    } catch (error) {
      console.log(`❌ Email send attempt ${attempt} failed for ${mailOptions.to}:`, error.message);
      
      // Check if it's a rate limiting error
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || 
          error.message.includes('throttling') || error.message.includes('rate')) {
        
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Rate limit hit, waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }
      }
      
      // If it's the last attempt or not a rate limit error, return error
      if (attempt === retries) {
        console.log(`🚫 All retry attempts failed for ${mailOptions.to}`);
        return { success: false, error: error.message };
      }
    }
  }
}

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to WebSocket');
  activeConnections.add(ws);
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket');
    activeConnections.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    activeConnections.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  activeConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(message);
      } catch (error) {
        console.error('❌ Error broadcasting to client:', error);
        activeConnections.delete(ws);
      }
    }
  });
}

// Bulk email sending with SES rate limiting
app.post('/api/send-bulk-campaign', async (req, res) => {
  try {
    const { 
      jobId, 
      contacts, 
      subject, 
      html, 
      from,
      fromName = "Allmamun from Websparks",
      fromEmail = DEFAULT_FROM_EMAIL,
      batchSize = DEFAULT_BATCH_SIZE,
      delayBetweenBatches = DELAY_BETWEEN_BATCHES 
    } = req.body;
    
    // Format the from address
    const formattedFrom = formatFromAddress(fromName, fromEmail);
    console.log(`📧 Using sender format: ${formattedFrom}`);
    
    if (!jobId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: jobId and contacts array are required'
      });
    }

    // Ensure batch size doesn't exceed SES limits
    const safeBatchSize = Math.min(batchSize, DEFAULT_BATCH_SIZE);
    const totalBatches = Math.ceil(contacts.length / safeBatchSize);

    console.log(`🚀 Starting bulk campaign: ${contacts.length} emails, ${totalBatches} batches of ${safeBatchSize}`);

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
      errors: [],
      retries: 0,
      fromAddress: formattedFrom
    };
    
    emailJobs.set(jobId, job);
    
    // Send initial job status
    broadcast({
      type: 'job_started',
      jobId,
      job: {
        totalEmails: contacts.length,
        startTime: job.startTime.toISOString(),
        totalBatches,
        fromAddress: formattedFrom
      }
    });

    // Process emails in batches with SES rate limiting
    const processBatch = async (batch, batchIndex) => {
      job.currentBatch = batchIndex + 1;
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} emails)`);
      
      broadcast({
        type: 'batch_started',
        jobId,
        batch: {
          id: `batch_${batchIndex + 1}`,
          number: batchIndex + 1,
          emails: batch.map(contact => contact.email)
        }
      });

      // Preview next batch
      if (batchIndex + 1 < totalBatches) {
        const nextBatchStart = (batchIndex + 1) * safeBatchSize;
        const nextBatch = contacts.slice(nextBatchStart, nextBatchStart + safeBatchSize);
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

      // Process emails sequentially with rate limiting
      const batchResults = [];
      
      for (let i = 0; i < batch.length; i++) {
        const contact = batch[i];
        
        try {
          broadcast({
            type: 'email_sending',
            jobId,
            email: contact.email,
            timestamp: new Date().toISOString()
          });

          // Replace template variables
          let personalizedHtml = html
            .replace(/\{\{firstName\}\}/g, contact.firstName || 'Valued Customer')
            .replace(/\{\{lastName\}\}/g, contact.lastName || '')
            .replace(/\{\{email\}\}/g, contact.email)
            .replace(/\{\{companyName\}\}/g, 'WebSparks AI');
          
          const mailOptions = {
            from: formattedFrom,
            to: contact.email,
            subject,
            html: personalizedHtml
          };

          // Send email with retry logic
          const emailResult = await retryEmailSend(mailOptions);
          
          if (emailResult.success) {
            // Update job stats
            job.sent++;
            job.success++;
            job.pending--;
            
            broadcast({
              type: 'email_sent',
              jobId,
              email: contact.email,
              status: 'sent',
              messageId: emailResult.result.messageId,
              timestamp: new Date().toISOString(),
              progress: {
                sent: job.sent,
                success: job.success,
                failed: job.failed,
                pending: job.pending,
                rate: Math.floor(job.sent / ((new Date() - job.startTime) / 1000)) || 0
              }
            });
            
            batchResults.push({
              email: contact.email,
              success: true,
              messageId: emailResult.result.messageId
            });
          } else {
            throw new Error(emailResult.error);
          }
          
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
          
          batchResults.push({
            email: contact.email,
            success: false,
            error: error.message
          });
        }
        
        // Add delay between individual emails (except for the last email in batch)
        if (i < batch.length - 1) {
          await sleep(DELAY_BETWEEN_EMAILS);
        }
      }
      
      return batchResults;
    };

    // Process all batches
    const results = [];
    for (let i = 0; i < contacts.length; i += safeBatchSize) {
      const batch = contacts.slice(i, i + safeBatchSize);
      const batchIndex = Math.floor(i / safeBatchSize);
      
      const batchResults = await processBatch(batch, batchIndex);
      results.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i + safeBatchSize < contacts.length) {
        console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
        await sleep(delayBetweenBatches);
      }
    }

    // Mark job as completed
    job.status = 'completed';
    job.endTime = new Date();
    emailJobs.set(jobId, job);
    
    const duration = Math.floor((job.endTime - job.startTime) / 1000);
    console.log(`✅ Bulk campaign completed in ${duration} seconds: ${job.success} successful, ${job.failed} failed`);
    
    broadcast({
      type: 'job_completed',
      jobId,
      results: {
        total: contacts.length,
        successful: job.success,
        failed: job.failed,
        duration: duration,
        fromAddress: formattedFrom
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
        duration: duration,
        fromAddress: formattedFrom,
        details: results
      }
    });
    
  } catch (error) {
    console.error('❌ Bulk campaign error:', error);
    
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
    console.log('✅ AWS SES connection test successful');
    res.json({ 
      success: true, 
      message: 'AWS SES connection successful',
      sender: DEFAULT_FROM,
      rateLimit: `${SES_RATE_LIMIT} emails/second`,
      batchSize: DEFAULT_BATCH_SIZE
    });
  } catch (error) {
    console.error('❌ AWS SES connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send single email endpoint with retry logic
app.post('/api/send-email', async (req, res) => {
  try {
    const { 
      to, 
      subject, 
      html, 
      from,
      fromName = "Allmamun from Websparks",
      fromEmail = DEFAULT_FROM_EMAIL
    } = req.body;

    // Format the from address
    const formattedFrom = formatFromAddress(fromName, fromEmail);
    console.log(`📧 Sending single email from: ${formattedFrom} to: ${to}`);

    const mailOptions = {
      from: formattedFrom,
      to,
      subject,
      html
    };

    const emailResult = await retryEmailSend(mailOptions);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: emailResult.result.messageId,
        fromAddress: formattedFrom
      });
    } else {
      throw new Error(emailResult.error);
    }
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send campaign endpoint with rate limiting
app.post('/api/send-campaign', async (req, res) => {
  try {
    const { 
      contacts, 
      subject, 
      template, 
      from,
      fromName = "Allmamun from Websparks",
      fromEmail = DEFAULT_FROM_EMAIL
    } = req.body;
    
    // Format the from address
    const formattedFrom = formatFromAddress(fromName, fromEmail);
    console.log(`📧 Sending campaign from: ${formattedFrom} to ${contacts.length} recipients`);
    
    const results = [];
    
    // Process emails sequentially with rate limiting
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        // Replace template variables
        let personalizedTemplate = template
          .replace(/\{\{firstName\}\}/g, contact.firstName || 'Valued Customer')
          .replace(/\{\{lastName\}\}/g, contact.lastName || '')
          .replace(/\{\{email\}\}/g, contact.email)
          .replace(/\{\{companyName\}\}/g, 'WebSparks AI');
        
        const mailOptions = {
          from: formattedFrom,
          to: contact.email,
          subject,
          html: personalizedTemplate
        };

        const emailResult = await retryEmailSend(mailOptions);
        
        if (emailResult.success) {
          results.push({
            email: contact.email,
            success: true,
            messageId: emailResult.result.messageId
          });
        } else {
          results.push({
            email: contact.email,
            success: false,
            error: emailResult.error
          });
        }
        
      } catch (error) {
        results.push({
          email: contact.email,
          success: false,
          error: error.message
        });
      }
      
      // Add delay between emails (except for the last one)
      if (i < contacts.length - 1) {
        await sleep(DELAY_BETWEEN_EMAILS);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ Campaign completed: ${successCount} successful, ${failureCount} failed`);

    res.json({
      success: true,
      message: `Campaign sent: ${successCount} successful, ${failureCount} failed`,
      fromAddress: formattedFrom,
      results,
      stats: { successCount, failureCount, totalSent: contacts.length }
    });
  } catch (error) {
    console.error('❌ Campaign sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Pause job endpoint
app.post('/api/pause-job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = emailJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  job.status = 'paused';
  emailJobs.set(jobId, job);
  
  broadcast({
    type: 'job_paused',
    jobId
  });
  
  res.json({
    success: true,
    message: 'Job paused successfully'
  });
});

// Resume job endpoint
app.post('/api/resume-job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = emailJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  job.status = 'running';
  emailJobs.set(jobId, job);
  
  broadcast({
    type: 'job_resumed',
    jobId
  });
  
  res.json({
    success: true,
    message: 'Job resumed successfully'
  });
});

// Stop job endpoint
app.post('/api/stop-job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = emailJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  job.status = 'stopped';
  job.endTime = new Date();
  emailJobs.set(jobId, job);
  
  broadcast({
    type: 'job_stopped',
    jobId
  });
  
  res.json({
    success: true,
    message: 'Job stopped successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email server is running',
    timestamp: new Date().toISOString(),
    activeJobs: emailJobs.size,
    activeConnections: activeConnections.size,
    config: {
      sender: DEFAULT_FROM,
      rateLimit: `${SES_RATE_LIMIT} emails/second`,
      batchSize: DEFAULT_BATCH_SIZE,
      emailDelay: `${DELAY_BETWEEN_EMAILS}ms`,
      batchDelay: `${DELAY_BETWEEN_BATCHES}ms`
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`🔌 WebSocket server running on port ${PORT}`);
  console.log(`📧 Default sender: ${DEFAULT_FROM}`);
  console.log(`⚡ SES Rate Limit: ${SES_RATE_LIMIT} emails/second`);
  console.log(`📦 Batch Size: ${DEFAULT_BATCH_SIZE} emails`);
  console.log(`⏱️  Email Delay: ${DELAY_BETWEEN_EMAILS}ms`);
  console.log(`⏱️  Batch Delay: ${DELAY_BETWEEN_BATCHES}ms`);
  console.log(`🔄 Max Retries: ${MAX_RETRIES}`);
  console.log('✅ Server ready to send emails!');
});