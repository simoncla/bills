import { Invoice } from '../types/invoice';
import { Contact } from '../types/invoice';

const INVOICES_KEY = 'invoices';
const COMPANY_KEY = 'company';
const CONTACTS_KEY = 'contacts';

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const getInvoices = (): Invoice[] => {
  const stored = localStorage.getItem(INVOICES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getInvoice = (id: string): Invoice | null => {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === id) || null;
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
};

export const saveCompanyInfo = (company: any): void => {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
};

export const getCompanyInfo = (): any => {
  const stored = localStorage.getItem(COMPANY_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const generateInvoiceNumber = (): string => {
  const invoices = getInvoices();
  const lastNumber = invoices.length > 0 
    ? Math.max(...invoices.map(inv => parseInt(inv.invoiceNumber.replace(/\D/g, '')) || 0))
    : 0;
  return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
};

export const saveReusableContact = (contact: Contact): void => {
  const contacts = getReusableContacts();
  const existingIndex = contacts.findIndex(c => c.id === contact.id);
  
  if (existingIndex >= 0) {
    contacts[existingIndex] = contact;
  } else {
    contacts.push(contact);
  }
  
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

export const getReusableContacts = (): Contact[] => {
  const stored = localStorage.getItem(CONTACTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteReusableContact = (id: string): void => {
  const contacts = getReusableContacts();
  const filtered = contacts.filter(contact => contact.id !== id);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
};