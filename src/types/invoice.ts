export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Company {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  paymentDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
  };
}

export interface Client {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

export interface Contact extends Company {
  id: string;
  type: 'company' | 'client';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: Company;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentTerms: string;
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  currency: 'USD' | 'GBP';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}