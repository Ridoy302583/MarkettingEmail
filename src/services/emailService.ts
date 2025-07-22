const API_BASE_URL = 'http://localhost:3001/api';

export interface EmailContact {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendCampaignRequest {
  contacts: EmailContact[];
  subject: string;
  template: string;
  from?: string;
}

export const emailService = {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to email server'
      };
    }
  },

  async sendEmail(request: SendEmailRequest): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email'
      };
    }
  },

  async sendCampaign(request: SendCampaignRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/send-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send campaign'
      };
    }
  }
};