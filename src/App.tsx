import React, { useState } from 'react';
import { initializeStorage } from './utils/fileStorage';
import { Invoice } from './types/invoice';
import { Navigation } from './components/Navigation';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';
import { InvoicePreview } from './components/InvoicePreview';
import { Contacts } from './components/Contacts';
import { Settings } from './components/Settings';
import { Toast } from './components/Toast';
import { exportToPDF } from './utils/pdfExport';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

function App() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize storage on app start
  React.useEffect(() => {
    initializeStorage().catch(console.error);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const toast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type
    };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setActiveTab('create');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('create');
  };

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    const { generateInvoiceNumber } = await import('./utils/fileStorage');
    const newInvoiceNumber = await generateInvoiceNumber();
    
    const duplicatedInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: newInvoiceNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedInvoice(duplicatedInvoice);
    setActiveTab('create');
    showToast('Invoice duplicated! Update the due date and save.', 'success');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log('App: handleViewInvoice called with invoice:', invoice);
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setActiveTab('dashboard');
    setSelectedInvoice(null);
    showToast('Invoice saved successfully!', 'success');
  };

  const handleCancelEdit = () => {
    setSelectedInvoice(null);
    setActiveTab('dashboard');
  };

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      await exportToPDF(invoice);
      showToast('PDF exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export PDF. Please try again.', 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <InvoiceForm
            invoice={selectedInvoice || undefined}
            onSave={handleSaveInvoice}
            onCancel={handleCancelEdit}
            onPreview={handleViewInvoice}
          />
        );
      case 'invoices':
      default:
        return (
          <InvoiceList
            onCreateInvoice={handleCreateInvoice}
            onEditInvoice={handleEditInvoice}
            onViewInvoice={handleViewInvoice}
            onExportPDF={handleExportPDF}
            onDuplicateInvoice={handleDuplicateInvoice}
          />
        );
      case 'contacts':
        return <Contacts />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-8">
        {renderContent()}
      </main>

      {/* Invoice Preview Modal */}
      {showPreview && selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={() => setShowPreview(false)}
          onExportPDF={handleExportPDF}
        />
      )}

      {/* Toast Messages */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;