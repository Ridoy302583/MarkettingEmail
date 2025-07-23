import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import Contacts from './components/Contacts';
import Templates from './components/Templates';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import EmailMonitor from './components/EmailMonitor';
import { EmailTemplate } from './data/emailTemplates';
import Auth from './components/Auth';

type ActiveSection = 'dashboard' | 'campaigns' | 'contacts' | 'templates' | 'analytics' | 'settings' | 'monitor';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // API configuration
  const API_BASE_URL = 'https://api.websparks.ai';

  // Validate token with API
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired
        return false;
      } else {
        // For other errors, we might want to check if token exists and is properly formatted
        // This is a fallback in case the validation endpoint is temporarily unavailable
        return isTokenWellFormed(token);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // If we can't reach the server, check if token is well-formed as fallback
      return isTokenWellFormed(token);
    }
  };

  // Check if token is well-formed (basic JWT structure check)
  const isTokenWellFormed = (token: string): boolean => {
    if (!token) return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Try to decode the payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token has expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // Handle logout - call API and clear token
  const handleLogout = async () => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      try {
        // Call the signout API endpoint
        await fetch(`${API_BASE_URL}/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        });
        
        console.log('Successfully signed out from server');
      } catch (error) {
        console.error('Error during server signout:', error);
        // Continue with local logout even if server call fails
      }
    }
    
    // Clear local storage and update state regardless of server response
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setActiveSection('dashboard'); // Reset to dashboard for next login
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsValidating(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsLoggedIn(false);
        setIsValidating(false);
        return;
      }

      const isValid = await validateToken(token);
      
      if (isValid) {
        setIsLoggedIn(true);
      } else {
        // Token is invalid, clear it and redirect to login
        localStorage.removeItem('access_token');
        setIsLoggedIn(false);
      }
      
      setIsValidating(false);
    };

    checkAuth();
  }, []);

  // Global error handler for API calls to catch 401/403 responses
  const handleApiError = (error: any, response?: Response) => {
    if (response && (response.status === 401 || response.status === 403)) {
      console.log('Authentication failed, redirecting to login...');
      handleLogout();
    }
  };

  // Provide the error handler to child components via context or props
  useEffect(() => {
    // Set up a global error handler for fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check if response indicates authentication failure
        if (response.status === 401 || response.status === 403) {
          const url = args[0]?.toString() || '';
          // Only handle auth errors for our API endpoints
          if (url.includes(API_BASE_URL)) {
            handleLogout();
          }
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setActiveSection('campaigns');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Optionally validate the token immediately after login
    const token = localStorage.getItem('access_token');
    if (token) {
      validateToken(token).then(isValid => {
        if (!isValid) {
          handleLogout();
        }
      });
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns selectedTemplate={selectedTemplate} />;
      case 'contacts':
        return <Contacts />;
      case 'templates':
        return <Templates onUseTemplate={handleUseTemplate} />;
      case 'analytics':
        return <Analytics />;
      case 'monitor':
        return <EmailMonitor />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading screen while validating token
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main application if authenticated
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}

export default App;