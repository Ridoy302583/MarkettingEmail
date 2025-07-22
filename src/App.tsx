import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import Contacts from './components/Contacts';
import Templates from './components/Templates';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { EmailTemplate } from './data/emailTemplates';

type ActiveSection = 'dashboard' | 'campaigns' | 'contacts' | 'templates' | 'analytics' | 'settings';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleUseTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setActiveSection('campaigns');
  };
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns />;
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-hidden">
        {renderActiveSection()}
      </main>
    </div>
  );
}

export default App;