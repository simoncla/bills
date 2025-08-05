import React, { useState, useEffect } from 'react';
import { Contact } from '../types/invoice';
import { getSavedClients, saveSavedClient, deleteSavedClient } from '../utils/fileStorage';
import { Plus, Edit, Trash2, Users, Building, User, Save, X } from 'lucide-react';

export const Contacts: React.FC = () => {
  const [savedClients, setSavedClients] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Contact | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'company' | 'client'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Omit<Contact, 'id' | 'createdAt'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    type: 'client'
  });

  useEffect(() => {
    const loadData = async () => {
      await loadClients();
    };
    loadData();
  }, []);

  const loadClients = async () => {
    const clients = await getSavedClients();
    setSavedClients(clients);
  };

  const handleSave = async () => {
    const client: Contact = {
      ...formData,
      id: editingClient?.id || Date.now().toString(),
      createdAt: editingClient?.createdAt || new Date().toISOString()
    };

    await saveSavedClient(client);
    await loadClients();
    resetForm();
  };

  const handleEdit = (client: Contact) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      phone: client.phone,
      email: client.email,
      type: client.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSavedClient(id);
    await loadClients();
    setShowDeleteModal(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      type: 'client'
    });
    setEditingClient(null);
    setShowForm(false);
  };

  const filteredClients = savedClients.filter(client => {
    const matchesFilter = filter === 'all' || client.type === filter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clients</h2>
          <p className="text-gray-600">
            Manage your reusable client information for invoices
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'company' | 'client')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              <option value="company">Companies</option>
              <option value="client">Individual Clients</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Get started by adding your first client.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredClients.map((client) => (
              <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {client.type === 'company' ? (
                      <Building className="h-5 w-5 text-blue-600 mr-2" />
                    ) : (
                      <User className="h-5 w-5 text-green-600 mr-2" />
                    )}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      client.type === 'company' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {client.type}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(client.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-gray-600">{client.email}</p>
                  <p className="text-gray-600">{client.phone}</p>
                  <p className="text-gray-600">
                    {client.address && `${client.address}, `}
                    {client.city && `${client.city}, `}
                    {client.state} {client.zipCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'company' | 'client' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="client">Individual Client</option>
                  <option value="company">Company</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Client name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ZIP Code"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.email}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingClient ? 'Update' : 'Save'} Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Client</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
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