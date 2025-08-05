import React, { useState, useEffect } from 'react';
import { Company } from '../types/invoice';
import { getCompanyInfo, saveCompanyInfo } from '../utils/fileStorage';
import { Save, Building, Download, Upload, FileText } from 'lucide-react';

export const Settings: React.FC = () => {
  const [company, setCompany] = useState<Company>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    paymentDetails: {
      accountName: '',
      accountNumber: '',
      sortCode: ''
    }
  });
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      const savedCompany = await getCompanyInfo();
      if (savedCompany) {
        setCompany({
          ...savedCompany,
          paymentDetails: savedCompany.paymentDetails || {
            accountName: '',
            accountNumber: '',
            sortCode: ''
          }
        });
      }
    };
    
    loadCompany();
  }, []);

  const handleSave = async () => {
    console.log('Settings: Saving company data:', company);
    await saveCompanyInfo(company);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      // Import the storage functions dynamically to avoid circular imports
      const { getInvoices, getSavedClients } = await import('../utils/fileStorage');
      
      // Gather all data
      const invoices = await getInvoices();
      const clients = await getSavedClients();
      const companyInfo = await getCompanyInfo();
      
      // Create backup object
      const backupData = {
        invoices,
        clients,
        company: companyInfo,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // Create and download file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_manager_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setImporting(true);
      
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Parse and validate data
      const importedData = JSON.parse(fileContent);
      
      // Basic validation
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Invalid file format');
      }
      
      if (!Array.isArray(importedData.invoices) || !Array.isArray(importedData.clients)) {
        throw new Error('Invalid data structure');
      }
      
      // Confirm with user before overwriting
      const confirmMessage = `This will replace all your current data with the imported data.\n\nImported data contains:\n- ${importedData.invoices.length} invoices\n- ${importedData.clients.length} clients\n- Company settings\n\nAre you sure you want to continue?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      // Save imported data to localStorage
      localStorage.setItem('invoices', JSON.stringify(importedData.invoices));
      localStorage.setItem('savedClients', JSON.stringify(importedData.clients));
      
      if (importedData.company) {
        localStorage.setItem('company', JSON.stringify(importedData.company));
      }
      
      alert('Data imported successfully! The page will now reload to apply changes.');
      
      // Reload page to refresh all components
      window.location.reload();
      
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Company Settings */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Building className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Update your company information that will appear on all invoices.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Street Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={company.city}
                onChange={(e) => setCompany({ ...company, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={company.state}
                onChange={(e) => setCompany({ ...company, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={company.zipCode}
                onChange={(e) => setCompany({ ...company, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ZIP Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="company@example.com"
            />
          </div>

          {/* Payment Details */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
            <p className="text-gray-600 mb-4">
              Add your bank account details that will appear on invoices for client payments.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={company.paymentDetails?.accountName || ''}
                  onChange={(e) => setCompany({ 
                    ...company, 
                    paymentDetails: { 
                      ...company.paymentDetails!, 
                      accountName: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Account holder name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={company.paymentDetails?.accountNumber || ''}
                  onChange={(e) => setCompany({ 
                    ...company, 
                    paymentDetails: { 
                      ...company.paymentDetails!, 
                      accountNumber: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
                <input
                  type="text"
                  value={company.paymentDetails?.sortCode || ''}
                  onChange={(e) => setCompany({ 
                    ...company, 
                    paymentDetails: { 
                      ...company.paymentDetails!, 
                      sortCode: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12-34-56"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

        {/* Data Backup & Restore */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Data Backup & Restore</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Export your data to create a backup file, or import a previously exported backup to restore your invoices, clients, and settings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download a backup file containing all your invoices, clients, and company settings.
              </p>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>


            {/* Import Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a backup file to restore your data. This will replace all current data.
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={importing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="import-file"
                />
                <button
                  disabled={importing}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Importing data will completely replace your current invoices, clients, and settings</li>
                    <li>Make sure to export your current data before importing if you want to keep it</li>
                    <li>Only import backup files created by this application</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};