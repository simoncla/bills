import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Company, Client, Contact } from '../types/invoice';
import { saveInvoice, generateInvoiceNumber, getCompanyInfo, saveCompanyInfo, getSavedClients, saveSavedClient } from '../utils/fileStorage';
import { calculateItemTotal, calculateSubtotal, calculateTax, calculateTotal, formatCurrency } from '../utils/calculations';
import { Plus, Trash2, Save, X, BookOpen } from 'lucide-react';
import { Eye } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  onPreview?: (invoice: Invoice) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel, onPreview }) => {
  const [company, setCompany] = useState<Company>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const [client, setClient] = useState<Client>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 'Net 30',
    notes: '',
    taxRate: 8.25,
    status: 'draft' as const,
    currency: 'USD' as const
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, total: 0 }
  ]);
  
  const [savedClients, setSavedClients] = useState<Contact[]>([]);

  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
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
      
      // Load saved clients
      const clients = await getSavedClients();
      setSavedClients(clients);

      if (invoice) {
        setClient(invoice.client);
        setInvoiceData({
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate,
          paymentTerms: invoice.paymentTerms,
          notes: invoice.notes,
          taxRate: invoice.taxRate,
          status: invoice.status,
          currency: invoice.currency || 'USD'
        });
        setItems(invoice.items);
        
        // Try to find matching client in saved clients
        const matchingClient = clients.find(c => 
          c.name === invoice.client.name && 
          c.email === invoice.client.email
        );
        setSelectedClientId(matchingClient?.id || '');
      } else {
        const newInvoiceNumber = await generateInvoiceNumber();
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: newInvoiceNumber
        }));
        // Reset client selection for new invoice
        setSelectedClientId('');
        setClient({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          email: ''
        });
      }
    };
    
    loadData();
  }, [invoice]);

  // Load saved clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      const clients = await getSavedClients();
      setSavedClients(clients);
    };
    
    loadClients();
  }, []);

  const handleSelectClient = (clientId: string) => {
    const savedClient = savedClients.find(c => c.id === clientId);
    if (!savedClient) return;

    const clientData = {
      name: savedClient.name,
      address: savedClient.address,
      city: savedClient.city,
      state: savedClient.state,
      zipCode: savedClient.zipCode,
      phone: savedClient.phone,
      email: savedClient.email
    };

    setClient(clientData);
    setSelectedClientId(clientId);
  };

  const handleClientDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    
    if (clientId) {
      handleSelectClient(clientId);
    } else {
      // Clear client form when no client is selected
      setClient({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: ''
      });
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = calculateItemTotal(newItems[index].quantity, newItems[index].price);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = calculateSubtotal(items);
  const taxAmount = calculateTax(subtotal, invoiceData.taxRate);
  const total = calculateTotal(subtotal, taxAmount);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!company.name) newErrors.companyName = 'Please set up your company information in Settings';
    if (!selectedClientId) newErrors.clientSelection = 'Please select a client';
    if (!invoiceData.dueDate) newErrors.dueDate = 'Due date is required';
    
    items.forEach((item, index) => {
      if (!item.description) newErrors[`item${index}Description`] = 'Description is required';
      if (item.quantity <= 0) newErrors[`item${index}Quantity`] = 'Quantity must be greater than 0';
      if (item.price <= 0) newErrors[`item${index}Price`] = 'Price must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    console.log('InvoiceForm: Creating invoice with company:', company);
    const newInvoice: Invoice = {
      id: invoice?.id || Date.now().toString(),
      ...invoiceData,
      company,
      client,
      items,
      subtotal,
      taxAmount,
      total,
      createdAt: invoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('InvoiceForm: Created invoice object:', newInvoice);

    await saveInvoice(newInvoice);
    onSave(newInvoice);
  };

  const handlePreview = () => {
    const previewInvoice: Invoice = {
      id: invoice?.id || 'preview',
      ...invoiceData,
      company,
      client,
      items,
      subtotal,
      taxAmount,
      total,
      createdAt: invoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onPreview) {
      onPreview(previewInvoice);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <span className="text-sm text-gray-500">(Edit in Settings)</span>
            </div>
            {company.name ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-gray-900">{company.name}</p>
                <p className="text-gray-600">{company.email}</p>
                <p className="text-gray-600">{company.phone}</p>
                <div className="text-gray-600">
                  {company.address && <p>{company.address}</p>}
                  <p>{company.city} {company.state} {company.zipCode}</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Please set up your company information in Settings before creating invoices.
                </p>
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
              <span className="text-sm text-gray-500">(Manage in Clients tab)</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
              <select
                value={selectedClientId}
                onChange={handleClientDropdownChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientSelection ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a client...</option>
                {savedClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              {errors.clientSelection && <p className="text-red-500 text-sm mt-1">{errors.clientSelection}</p>}
            </div>
            
            {selectedClientId && client.name ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-gray-600">{client.email}</p>
                <p className="text-gray-600">{client.phone}</p>
                <div className="text-gray-600">
                  {client.address && <p>{client.address}</p>}
                  <p>{client.city} {client.state} {client.zipCode}</p>
                </div>
              </div>
            ) : savedClients.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  No clients found. Please add clients in the Clients tab first.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-0001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={invoiceData.paymentTerms}
                onChange={(e) => setInvoiceData({ ...invoiceData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value as 'USD' | 'GBP' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>


        {/* Items */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <button
              onClick={addItem}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`item${index}Description`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Item description"
                      />
                      {errors[`item${index}Description`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`item${index}Description`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`item${index}Quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        min="1"
                      />
                      {errors[`item${index}Quantity`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`item${index}Quantity`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`item${index}Price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        step="0.01"
                        min="0"
                      />
                      {errors[`item${index}Price`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`item${index}Price`]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(item.total, invoiceData.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{formatCurrency(subtotal, invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax Rate:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={invoiceData.taxRate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(taxAmount, invoiceData.currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(total, invoiceData.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <textarea
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes or payment instructions..."
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};