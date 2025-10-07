import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import type { Invoice } from '../types';
import { CreditCard, Download, Eye, Send, Settings, User, Trash2, Edit2 } from 'lucide-react';


export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clients, setClients] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      name: 'Free',
      price: 0,
      features: ['1 Tour/month', '5GB Storage', 'Community Support', 'Basic API'],
      clients: 50
    },
    {
      name: 'Pro',
      price: 29,
      features: ['10 Tours/month', '50GB Storage', 'Email Support', 'Standard API', 'Analytics'],
      clients: 45,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 99,
      features: ['Unlimited Tours', '500GB Storage', 'Priority Support', 'Full API', 'Custom Reports', 'Dedicated Manager'],
      clients: 21
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedClient, setSelectedClient] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [editingPlanIndex, setEditingPlanIndex] = useState<number>(-1);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newFeatures, setNewFeatures] = useState<string>('');

  // Mock data for clients (in real app, load from API)
  const mockClients = [
    { id: '1', name: 'Dr. Sarah Wilson', company: 'HealthcarePlus Clinic', currentPlan: 'Pro', nextBilling: '2025-11-04', status: 'active' },
    { id: '2', name: 'Michael Chen', company: 'Grand Hotels Group', currentPlan: 'Enterprise', nextBilling: '2025-10-15', status: 'active' },
    { id: '3', name: 'Emma Rodriguez', company: 'Prime Realty Solutions', currentPlan: 'Free', nextBilling: 'N/A', status: 'active' },
    { id: '4', name: 'Prof. David Kim', company: 'Tech University', currentPlan: 'Pro', nextBilling: '2025-10-20', status: 'active' },
    { id: '5', name: 'Lisa Thompson', company: 'Modern Medical Clinics', currentPlan: 'Free', nextBilling: 'N/A', status: 'inactive' },
  ];

  // Mock invoices for demo
  const mockInvoices: Invoice[] = [
    {
      id: '001', clientName: 'HealthcarePlus Clinic', amount: 299, status: 'paid' as const, dueDate: '2025-10-04', paidDate: '2025-10-03',
      clientId: ''
    },
    {
      id: '002', clientName: 'Grand Hotels Group', amount: 899, status: 'pending' as const, dueDate: '2025-10-15',
      clientId: ''
    },
    {
      id: '003', clientName: 'Prime Realty Solutions', amount: 0, status: 'paid' as const, dueDate: '2025-10-01', paidDate: '2025-10-01',
      clientId: ''
    },
    {
      id: '004', clientName: 'Tech University', amount: 29, status: 'overdue' as const, dueDate: '2025-09-30',
      clientId: ''
    },
    {
      id: '005', clientName: 'Modern Medical Clinics', amount: 0, status: 'paid' as const, dueDate: '2025-10-02', paidDate: '2025-10-02',
      clientId: ''
    },
  ];

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [invoiceData, clientData] = await Promise.all([api.getInvoices(), api.getClientSubscriptions()]);
      setInvoices(invoiceData || []);
      setClients(clientData || mockClients);
    } catch (error) {
      console.error('Failed to load data:', error);
      setInvoices(mockInvoices);
      setClients(mockClients); // Use mock for demo
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0);

  const assignPlan = async (clientId: string, plan: string) => {
    try {
      await api.assignPlan(clientId, plan);
      setClients(clients.map(c => c.id === clientId ? { ...c, currentPlan: plan } : c));
      setShowAssignPlanModal(false);
    } catch (error) {
      console.error('Failed to assign plan:', error);
    }
  };

  const changePlan = async (clientId: string, plan: string) => {
    try {
      await api.changePlan(clientId, plan);
      setClients(clients.map(c => c.id === clientId ? { ...c, currentPlan: plan } : c));
      setShowChangePlanModal(false);
    } catch (error) {
      console.error('Failed to change plan:', error);
    }
  };

  const cancelSubscription = async (clientId: string) => {
    try {
      await api.cancelSubscription(clientId);
      setClients(clients.map(c => c.id === clientId ? { ...c, currentPlan: 'Free', status: 'inactive' } : c));
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const getPlanVariant = (plan: string) => {
    switch (plan) {
      case 'Free': return 'default';
      case 'Pro': return 'success';
      case 'Enterprise': return 'info';
      default: return 'default';
    }
  };

  const openEditPlanModal = (index: number) => {
    setEditingPlanIndex(index);
    setNewPrice(subscriptionPlans[index].price);
    setNewFeatures(subscriptionPlans[index].features.join('\n'));
    setShowEditPlanModal(true);
  };

  const savePlan = () => {
    if (editingPlanIndex >= 0) {
      const newFeaturesArray = newFeatures
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      setSubscriptionPlans(prev => prev.map((plan, i) => 
        i === editingPlanIndex ? { ...plan, price: newPrice, features: newFeaturesArray } : plan
      ));
      // Optionally save to API
      console.log(`Updated ${subscriptionPlans[editingPlanIndex].name} plan: price $${newPrice}, features:`, newFeaturesArray);
    }
    setShowEditPlanModal(false);
    setEditingPlanIndex(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading billing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage subscriptions, invoices, and payment processing</p>
        </div>
        <Button onClick={() => setShowRazorpayModal(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Razorpay
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">This month</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">${pendingRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">Awaiting payment</p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">${overdueRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-2">Past due date</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway: Razorpay Integration */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateway Configuration</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Razorpay integration for secure payments</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">Status: Integrated</p>
            <Button variant="secondary" onClick={() => setShowRazorpayModal(true)}>
              Edit Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Plans</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current plan distribution and pricing</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-6 flex flex-col h-full ${
                  plan.popular 
                    ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-center mb-6">
                  {plan.popular && (
                    <div className="mb-2">
                    <Badge variant="info" >Most Popular</Badge>
                    </div>
                  )}
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {plan.clients} active clients
                  </p>
                </div>

                <ul className="space-y-3 mb-auto">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button variant="secondary" className="mt-auto w-full" onClick={() => openEditPlanModal(index)}>
                  Manage Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Subscriptions - Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Subscriptions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage plans for individual clients</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <User className="h-10 w-10 text-gray-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{client.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getPlanVariant(client.currentPlan)}>
                        {client.currentPlan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {client.nextBilling}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedClient(client); setShowAssignPlanModal(true); }}>
                          Assign
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedClient(client); setShowChangePlanModal(true); }}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Change
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => cancelSubscription(client.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Invoices ({invoices.length}) - Failed/Overdue Highlighted
            </h3>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${invoice.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        #INV-{invoice.id.padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {invoice.clientName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${invoice.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                      {invoice.paidDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'pending' && (
                          <Button size="sm" variant="ghost">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Configuration Modal */}
      <Modal isOpen={showRazorpayModal} onClose={() => setShowRazorpayModal(false)} title="Razorpay Integration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key ID</label>
            <input type="text" placeholder="rzp_test_xxx" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Secret</label>
            <input type="password" placeholder="your_key_secret" className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex space-x-4 pt-2">
            <Button className="flex-1" onClick={() => { /* Save to API */ console.log('Razorpay configured'); setShowRazorpayModal(false); }}>
              Save Configuration
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowRazorpayModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal isOpen={showAssignPlanModal} onClose={() => setShowAssignPlanModal(false)} title={`Assign Plan to ${selectedClient?.company}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a plan to assign:</p>
          <div className="space-y-2">
            {subscriptionPlans.map((plan) => (
              <Button
                key={plan.name}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => { setSelectedPlan(plan.name); assignPlan(selectedClient?.id || '', plan.name); }}
              >
                {plan.name} - ${plan.price}/mo
              </Button>
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setShowAssignPlanModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal isOpen={showChangePlanModal} onClose={() => setShowChangePlanModal(false)} title={`Change Plan for ${selectedClient?.company}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a new plan:</p>
          <div className="space-y-2">
            {subscriptionPlans.map((plan) => (
              <Button
                key={plan.name}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => { setSelectedPlan(plan.name); changePlan(selectedClient?.id || '', plan.name); }}
                disabled={plan.name === selectedClient?.currentPlan}
              >
                {plan.name} - ${plan.price}/mo {plan.name === selectedClient?.currentPlan && '(Current)'}
              </Button>
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setShowChangePlanModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={showEditPlanModal} onClose={() => setShowEditPlanModal(false)} title={`Edit Plan for ${subscriptionPlans[editingPlanIndex]?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Price ($/mo)</label>
            <input 
              type="number" 
              value={newPrice} 
              onChange={(e) => setNewPrice(Number(e.target.value))} 
              className="w-full border px-3 py-2 rounded" 
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (one per line)</label>
            <textarea 
              value={newFeatures} 
              onChange={(e) => setNewFeatures(e.target.value)} 
              className="w-full border px-3 py-2 rounded h-32 resize-none" 
              placeholder="Enter features, one per line"
            />
          </div>
          <div className="flex space-x-4 pt-2">
            <Button className="flex-1" onClick={savePlan}>
              Save Plan
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowEditPlanModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};