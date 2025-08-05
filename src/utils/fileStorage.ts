import { Invoice, Contact, Company } from '../types/invoice';

// Storage keys
const INVOICES_KEY = 'invoices';
const CLIENTS_KEY = 'savedClients';
const COMPANY_KEY = 'company';

// Helper function to read from localStorage
const readFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading from storage key ${key}:`, error);
    return defaultValue;
  }
};

// Helper function to write to localStorage
const writeToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to storage key ${key}:`, error);
    throw error;
  }
};

// Invoice operations
export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  const invoices = await getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push(invoice);
  }
  
  writeToStorage(INVOICES_KEY, invoices);
};

export const getInvoices = async (): Promise<Invoice[]> => {
  return readFromStorage(INVOICES_KEY, []);
};

export const getInvoice = async (id: string): Promise<Invoice | null> => {
  const invoices = await getInvoices();
  return invoices.find(inv => inv.id === id) || null;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const invoices = await getInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  writeToStorage(INVOICES_KEY, filtered);
};

// Saved Clients operations
export const saveSavedClient = async (client: Contact): Promise<void> => {
  const clients = await getSavedClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  writeToStorage(CLIENTS_KEY, clients);
};

export const getSavedClients = async (): Promise<Contact[]> => {
  return readFromStorage(CLIENTS_KEY, []);
};

export const deleteSavedClient = async (id: string): Promise<void> => {
  const clients = await getSavedClients();
  const filtered = clients.filter(client => client.id !== id);
  writeToStorage(CLIENTS_KEY, filtered);
};

// Company operations
export const saveCompanyInfo = async (company: Company): Promise<void> => {
  writeToStorage(COMPANY_KEY, company);
};

export const getCompanyInfo = async (): Promise<Company | null> => {
  return readFromStorage(COMPANY_KEY, null);
};

// Utility functions
export const generateInvoiceNumber = async (): Promise<string> => {
  const invoices = await getInvoices();
  const lastNumber = invoices.length > 0 
    ? Math.max(...invoices.map(inv => parseInt(inv.invoiceNumber.replace(/\D/g, '')) || 0))
    : 0;
  return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
};

// Initialize storage
export const initializeStorage = async (): Promise<void> => {
  // Ensure all storage keys exist with default values
  if (!localStorage.getItem(INVOICES_KEY)) {
    writeToStorage(INVOICES_KEY, []);
  }
  if (!localStorage.getItem(CLIENTS_KEY)) {
    writeToStorage(CLIENTS_KEY, []);
  }
  if (!localStorage.getItem(COMPANY_KEY)) {
    writeToStorage(COMPANY_KEY, null);
  }
};