import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceFilters } from '../types/invoice';
import { getInvoices, deleteInvoice } from '../utils/fileStorage';
import { formatCurrency } from '../utils/calculations';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Plus,
  FileText,
  Copy
} from 'lucide-react';

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onExportPDF: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ 
  onCreateInvoice, 
  onEditInvoice, 
  onViewInvoice, 
  onExportPDF,
  onDuplicateInvoice
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      const loadedInvoices = await getInvoices();
      setInvoices(loadedInvoices);
      setFilteredInvoices(loadedInvoices);
    };
    
    loadInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(invoice => 
        invoice.client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(invoice => new Date(invoice.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(invoice => new Date(invoice.date) <= new Date(filters.endDate));
    }

    setFilteredInvoices(filtered);
  }, [invoices, filters]);

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    setInvoices(updatedInvoices);
    setShowDeleteModal(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const defaultCurrency = filteredInvoices.length > 0 ? filteredInvoices[0].currency || 'USD' : 'USD';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Invoices</h2>
          <p className="text-gray-600">
            {filteredInvoices.length} invoices • Total: {formatCurrency(totalAmount, defaultCurrency)}
          </p>
        </div>
        <button
          onClick={onCreateInvoice}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by client or invoice number..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.startDate || filters.endDate
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first invoice.'}
            </p>
            <button
              onClick={onCreateInvoice}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(invoice.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditInvoice(invoice)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateInvoice(invoice)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onExportPDF(invoice)}
                          className="text-green-600 hover:text-green-800"
                          title="Export PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(invoice.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Invoice</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInvoice(showDeleteModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};