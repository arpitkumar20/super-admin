import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import type { Client } from '../types';
import { useTheme } from '../contexts/ThemeContext';

import { Search, Key, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());

  // Fetch clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientStatus = async (clientId: string, currentStatus: Client['status']) => {
    const newStatus: Client['status'] = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.updateClientStatus(clientId, newStatus);
      setClients(prev =>
        prev.map(c => (c.id === clientId ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      console.error('Failed to update client status:', error);
    }
  };

  const generateApiKey = async (clientId: string) => {
    setGeneratingApiKey(true);
    try {
      const newApiKey = await api.generateApiKey(clientId);
      setClients(prev =>
        prev.map(c => (c.id === clientId ? { ...c, apiKey: newApiKey } : c))
      );
      setShowApiKeyModal(false);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setGeneratingApiKey(false);
    }
  };

  const toggleApiKeyVisibility = (clientId: string) => {
    setVisibleApiKeys(prev => {
      const newVisible = new Set(prev);
      if (newVisible.has(clientId)) newVisible.delete(clientId);
      else newVisible.add(clientId);
      return newVisible;
    });
  };

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const filteredClients = clients.filter(client =>
    [client.name, client.company, client.email]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

const getStatusVariant = (status: Client['status']): "default" | "success" | "danger" | "warning" | "info" => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const getSubscriptionVariant = (sub: Client['subscription']): "default" | "success" | "danger" | "warning" | "info" => {
  switch (sub) {
    case 'enterprise':
      return 'info';
    case 'premium':
      return 'success';
    case 'basic':
      return 'default';
    default:
      return 'default';
  }
};


  const getUsagePercentage = (current: number, limit: number) =>
    Math.round((current / limit) * 100);

  if (loading)
    return (
      <div
        className={`flex items-center justify-center h-64 ${
          isDark ? 'text-gray-300' : 'text-gray-500'
        }`}
      >
        Loading clients...
      </div>
    );

  return (
    <div
      className={`min-h-screen p-6 space-y-6 ${
        isDark ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Management</h1>
          <p
            className={`mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Manage your clients and their subscriptions
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Clients ({filteredClients.length})
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead
                className={`${
                  isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Subscription</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">API Key</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? 'divide-gray-800 bg-gray-900' : 'divide-gray-200 bg-white'
                }`}
              >
                {filteredClients.map(client => {
                  const usagePercent = getUsagePercentage(
                    client.currentUsage,
                    client.usageLimit
                  );
                  const isApiKeyVisible = visibleApiKeys.has(client.id);
                  return (
                    <tr
                      key={client.id}
                      className={`${
                        isDark
                          ? 'hover:bg-gray-800/60'
                          : 'hover:bg-gray-50 transition'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.company}</div>
                        <div className="text-xs text-gray-400">{client.email}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {client.industry.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(client.status)}>
                          {client.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getSubscriptionVariant(client.subscription)}>
                          {client.subscription}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usagePercent > 90
                                ? 'bg-red-500'
                                : usagePercent > 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <span className="text-xs mt-1 block">
                          {client.currentUsage.toLocaleString()} /{' '}
                          {client.usageLimit.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 w-40 truncate">
                            {client.apiKey
                              ? isApiKeyVisible
                                ? client.apiKey
                                : '••••••••••••••'
                              : ''}
                          </code>
                          {client.apiKey ? (
                            <button
                              onClick={() => toggleApiKeyVisibility(client.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {isApiKeyVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedClient(client);
                                setShowApiKeyModal(true);
                              }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={client.status === 'active' ? 'danger' : 'primary'}
                          onClick={() => toggleClientStatus(client.id, client.status)}
                        >
                          {client.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openClientModal(client)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => console.log('Delete client', client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Client Profile"
      >
        {selectedClient && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{selectedClient.company}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
              {selectedClient.industry.replace('_', ' ')}
            </p>
            <p>
              Website:{' '}
              <a
                href={selectedClient.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                {selectedClient.website}
              </a>
            </p>
            <p>Contact: {selectedClient.contactPerson}</p>
            <p>
              Status:{' '}
              <Badge variant={getStatusVariant(selectedClient.status)}>
                {selectedClient.status}
              </Badge>
            </p>
            <p>
              Subscription:{' '}
              <Badge variant={getSubscriptionVariant(selectedClient.subscription)}>
                {selectedClient.subscription}
              </Badge>
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${getUsagePercentage(
                    selectedClient.currentUsage,
                    selectedClient.usageLimit
                  )}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {selectedClient.currentUsage.toLocaleString()} /{' '}
              {selectedClient.usageLimit.toLocaleString()}
            </span>
          </div>
        )}
      </Modal>

      {/* API Key Modal */}
      <Modal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="Generate API Key"
      >
        <div className="space-y-4">
          <p>
            Generate a new API key for <strong>{selectedClient?.company}</strong>?
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Warning: This will replace any existing API key.
          </p>
          <div className="flex gap-4 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowApiKeyModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                selectedClient && generateApiKey(selectedClient.id)
              }
              disabled={generatingApiKey}
            >
              {generatingApiKey ? 'Generating...' : 'Generate Key'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
