import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import Contacts from './components/Contacts';
import Templates from './components/Templates';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { EmailTemplate } from './data/emailTemplates';
import Auth from './components/Auth'; // Import the Auth component

type ActiveSection = 'dashboard' | 'campaigns' | 'contacts' | 'templates' | 'analytics' | 'settings';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setActiveSection('campaigns');
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
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-hidden">{renderActiveSection()}</main>
    </div>
  );
}

export default App;
