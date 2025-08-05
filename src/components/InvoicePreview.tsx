import React from 'react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { X, Download, Printer } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onExportPDF: (invoice: Invoice) => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onClose, onExportPDF }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={() => onExportPDF(invoice)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-preview" className="p-12 bg-white font-mono text-sm leading-relaxed max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="text-left">
                  <p className="text-gray-800 mb-1">[ FROM ]</p>
                  <p className="text-gray-800">{invoice.company.name}</p>
                  <p className="text-gray-800">{invoice.company.address}</p>
                  <p className="text-gray-800">{invoice.company.city} {invoice.company.zipCode}</p>
                </div>
              </div>
              <div>
                <div className="text-left">
                  <p className="text-gray-800 mb-1">[ BILLED TO ]</p>
                  <p className="text-gray-800">{invoice.client.name}</p>
                  <p className="text-gray-800">{invoice.client.address}</p>
                  <p className="text-gray-800">{invoice.client.city} {invoice.client.zipCode}</p>
                </div>
              </div>
              <div className="text-right self-start">
                <p className="text-gray-800 mb-1">INVOICE #{invoice.invoiceNumber}</p>
                <p className="text-gray-800">{format(new Date(invoice.date), 'dd MMM yy').toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-16">
            <div className="mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-gray-400">
                <span className="text-gray-800 font-medium">DESCRIPTION</span>
                <div className="flex space-x-16">
                  <span className="text-gray-800 font-medium">RATE</span>
                  <span className="text-gray-800 font-medium">HOURS</span>
                  <span className="text-gray-800 font-medium">PRICE</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-gray-800 flex-1">{item.description.toUpperCase()}</span>
                  <div className="flex space-x-16 text-right">
                    <span className="text-gray-800 w-16">{formatCurrency(item.price, invoice.currency)}</span>
                    <span className="text-gray-800 w-16">{item.quantity}</span>
                    <span className="text-gray-800 w-20">{formatCurrency(item.total, invoice.currency)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-gray-400 mb-8"></div>

            <div className="space-y-2 text-right">
              <div className="flex justify-end">
                <div className="w-80 flex justify-between">
                  <span className="text-gray-800">TOTAL AMOUNT</span>
                  <span className="text-gray-800">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-end">
                  <div className="w-80 flex justify-between">
                    <span className="text-gray-800">VAT ({invoice.taxRate}%)</span>
                    <span className="text-gray-800">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <div className="w-80 flex justify-between font-medium">
                  <span className="text-gray-800">AMOUNT DUE</span>
                  <span className="text-gray-800">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thank you message */}
          <div className="text-center mb-16">
            <p className="text-gray-800">THANK YOU FOR YOUR BUSINESS!</p>
            <p className="text-gray-800 mt-2">{invoice.company.email} | {invoice.company.phone}</p>
          </div>

          {/* Footer with company info and large INVOICE text */}
          <div className="flex justify-between items-end">
            <div className="text-left">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">INVOICE</h1>
            </div>
            <div className="text-right text-gray-800">
              {invoice.company.paymentDetails && (
                invoice.company.paymentDetails.accountName || 
                invoice.company.paymentDetails.accountNumber || 
                invoice.company.paymentDetails.sortCode
              ) && (
                <div className="mt-8">
                  <p className="text-gray-800 font-medium mb-2">[ PAYMENT DETAILS ]</p>
                  {invoice.company.paymentDetails.accountName && (
                    <p className="text-gray-800">ACCOUNT NAME: {invoice.company.paymentDetails.accountName}</p>
                  )}
                  {invoice.company.paymentDetails.accountNumber && (
                    <p className="text-gray-800">ACCOUNT NUMBER: {invoice.company.paymentDetails.accountNumber}</p>
                  )}
                  {invoice.company.paymentDetails.sortCode && (
                    <p className="text-gray-800">SORT CODE: {invoice.company.paymentDetails.sortCode}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-gray-800 font-medium mb-2">NOTES</h3>
              <p className="text-gray-800">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};