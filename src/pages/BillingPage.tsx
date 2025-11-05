import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Switch } from '../components/ui/Switch';
import { api } from '../services/api';
import { adminRazorpayService, AdminPaymentOptions } from '../services/adminRazorpay';
import type { Invoice } from '../types';
import { CreditCard, Download, Eye, Send, User, Trash2, CheckCircle, XCircle, Calendar, IndianRupee } from 'lucide-react';

// Simple payment result interface
interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}


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
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdminPaymentModal, setShowAdminPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedClient, setSelectedClient] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlan, setSelectedPlan] = useState<string>('');


  
  // Admin payment states
  const [adminPaymentData, setAdminPaymentData] = useState({
    clientId: '',
    plan: 'Pro',
    durationMonths: 1
  });

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
      // Load actual onboarded clients from API
      const [invoiceData, onboardedClients] = await Promise.all([
        api.getInvoices(), 
        api.getClients() // Get actual onboarded clients
      ]);
      
      setInvoices((invoiceData as Invoice[]) || mockInvoices);
      
      // Map onboarded clients to billing format with payment status
      const clientsWithBilling = onboardedClients.map(client => ({
        id: client.id,
        name: client.name,
        company: client.name, // Use name as company if company field not available
        email: client.email,
        phone: client.phone,
        currentPlan: client.currentPlan || 'Free',
        status: client.status === 'approved' ? 'active' : 'pending',
        nextBilling: client.currentPlan && client.currentPlan !== 'Free' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
          : 'N/A',
        paymentStatus: client.currentPlan === 'Free' ? 'paid' : 
                      client.status === 'approved' ? 'paid' : 'pending',
        lastPayment: client.status === 'approved' ? new Date().toISOString().split('T')[0] : null
      }));
      
      setClients(clientsWithBilling);
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

  const changePlan = async (clientId: string, planName: string) => {
    try {
      // Close the plan selection modal first
      setShowChangePlanModal(false);
      
      // Start payment process for the new plan
      console.log(`🔄 Initiating plan change to ${planName} for client ${clientId}`);
      await processClientPayment(planName, clientId);
      
    } catch (error) {
      console.error('Failed to initiate plan change:', error);
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

  // Simple payment processing placeholder
  const processPayment = async (planName: string, amount: number) => {
    if (!selectedClient) return;

    setPaymentLoading(true);
    setShowPaymentModal(true);
    
    try {
      console.log('� Processing payment:', { planName, amount, clientId: selectedClient.id });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success for demo
      const result: PaymentResult = {
        success: true,
        paymentId: `pay_${Date.now()}`,
        orderId: `order_${Date.now()}`
      };

      setPaymentResult(result);
      
      if (result.success) {
        // Update client plan on successful payment
        setClients(clients.map(c => 
          c.id === selectedClient.id 
            ? { ...c, currentPlan: planName, status: 'active' } 
            : c
        ));
        
        // Close plan selection modals
        setShowAssignPlanModal(false);
        setShowChangePlanModal(false);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult({
        success: false,
        error: 'Payment failed. Please try again.'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentResult(null);
    setSelectedClient(null);
  };

  // Admin payment processing function
  const processAdminPayment = async (clientId: string, plan: string, months: number) => {
    try {
      setPaymentLoading(true);
      
      // Find the client
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Get plan details
      const selectedPlan = subscriptionPlans.find(p => p.name === plan);
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }

      console.log(`🏦 Admin processing payment for ${client.name || client.company}`);

      // Prepare payment options
      const paymentOptions: AdminPaymentOptions = {
        amount: selectedPlan.price,
        currency: 'INR',
        clientId: client.id,
        clientName: client.name || client.company,
        clientEmail: client.email || 'client@example.com',
        clientPhone: client.phone || '9999999999',
        plan: selectedPlan.name,
        durationMonths: months
      };

      // Process payment through Razorpay
      const result = await adminRazorpayService.processClientPayment(paymentOptions);

      if (result.success) {
        console.log('✅ Admin payment successful!', result);
        
        // Update client status
        const updatedClients = clients.map(c => 
          c.id === clientId 
            ? { 
                ...c, 
                paymentStatus: 'paid' as const,
                currentPlan: plan,
                subscriptionEndDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            : c
        );
        setClients(updatedClients);

        // Generate invoice
        const newInvoice: Invoice = {
          id: `INV-${Date.now()}`,
          clientId: client.id,
          clientName: client.name || client.company,
          amount: selectedPlan.price * months,
          status: 'paid' as const,
          dueDate: new Date().toLocaleDateString(),
          paidDate: new Date().toLocaleDateString()
        };
        setInvoices(prev => [newInvoice, ...prev]);

        setPaymentResult({
          success: true,
          paymentId: result.paymentId,
          orderId: result.orderId,
          signature: result.signature
        });

        setShowPaymentModal(true);
        setShowAdminPaymentModal(false);

      } else {
        console.error('❌ Admin payment failed:', result.error);
        setPaymentResult({
          success: false,
          error: result.error || 'Payment failed'
        });
        setShowPaymentModal(true);
      }

    } catch (error) {
      console.error('💥 Admin payment error:', error);
      setPaymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      });
      setShowPaymentModal(true);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle plan assignment toggle
  const togglePlanAssignment = (client: { id: string; name: string; currentPlan: string }, newPlan: string) => {
    setClients(prevClients =>
      prevClients.map(c =>
        c.id === client.id
          ? { ...c, currentPlan: newPlan }
          : c
      )
    );
    console.log(`Toggled ${client.name}'s plan to: ${newPlan}`);
  };

  // Process payment for specific client with their current plan
  const processClientPayment = async (planType: string, clientId: string) => {
    setLoading(true);
    setPaymentResult(null);

    try {
      console.log(`� Processing payment for client: ${clientId}, plan: ${planType}`);
      
      // Get plan details based on planType
      const selectedPlan = subscriptionPlans.find(plan => 
        plan.name.toLowerCase() === planType.toLowerCase() || 
        plan.name.toLowerCase().includes(planType.toLowerCase())
      );

      if (!selectedPlan) {
        throw new Error(`Plan "${planType}" not found`);
      }

      // Find the client
      const client = clients.find(c => c.id === clientId);
      if (!client) {
        throw new Error(`Client with ID "${clientId}" not found`);
      }

      console.log(`💰 Processing payment: ₹${selectedPlan.price} for ${selectedPlan.name} plan`);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      const result: PaymentResult = {
        success: true,
        paymentId: `pay_${Date.now()}`,
        orderId: `order_${Date.now()}`
      };

      if (result.success) {
        console.log('✅ Payment successful!', result);
        
        setPaymentResult({
          success: true,
          paymentId: result.paymentId,
          orderId: result.orderId,
          signature: result.signature,
          error: undefined
        });

        // Update client payment status and plan
        const updatedClients = clients.map(c => 
          c.id === clientId 
            ? { 
                ...c, 
                paymentStatus: 'paid' as const,
                currentPlan: selectedPlan.name // Update to the new plan
              }
            : c
        );
        setClients(updatedClients);

        // Update plans data - remove from old plan and add to new plan
        const client = clients.find(c => c.id === clientId);
        const oldPlanName = client?.currentPlan;
        
        const updatedPlans = subscriptionPlans.map(plan => {
          if (plan.name === selectedPlan.name) {
            // Add client to new plan
            return { ...plan, clients: plan.clients + 1 };
          } else if (plan.name === oldPlanName && oldPlanName !== selectedPlan.name) {
            // Remove client from old plan
            return { ...plan, clients: Math.max(0, plan.clients - 1) };
          }
          return plan;
        });
        setSubscriptionPlans(updatedPlans);

        // Generate invoice
        const newInvoice: Invoice = {
          id: `INV-${Date.now()}`,
          clientId: client.id,
          clientName: client.name || client.company,
          amount: selectedPlan.price,
          status: 'paid' as const,
          dueDate: new Date().toLocaleDateString(),
          paidDate: new Date().toLocaleDateString()
        };
        setInvoices(prev => [newInvoice, ...prev]);

        console.log(`📄 Plan changed from ${oldPlanName} to ${selectedPlan.name} for ${client.name || client.company}`);
        console.log('📄 Invoice generated:', newInvoice.id);

      } else {
        console.log('❌ Payment failed:', result.error);
        
        setPaymentResult({
          success: false,
          error: result.error || 'Payment failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('💥 Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during payment processing';
      
      setPaymentResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setLoading(false);
      console.log('🏁 Payment process completed');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage subscriptions, invoices, and payment processing</p>
        </div>
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

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Plans</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current plan distribution and pricing</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
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


              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Subscriptions - Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Subscriptions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage plans for individual clients and process payments</p>
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
                    Payment Status
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={client.paymentStatus === 'paid' ? 'success' : 'warning'}>
                        {client.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {client.nextBilling}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {client.paymentStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => processClientPayment(client.currentPlan, client.id)}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Processing...
                              </div>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Admin Payment Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedClient(client);
                            setAdminPaymentData({
                              clientId: client.id,
                              plan: client.currentPlan,
                              durationMonths: 1
                            });
                            setShowAdminPaymentModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                          <IndianRupee className="h-4 w-4 mr-1" />
                          Admin Pay
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={client.currentPlan !== 'Free'}
                            onChange={(checked) => togglePlanAssignment(client, checked ? 'Pro' : 'Free')}
                            size="sm"
                            label="Active"
                          />
                        </div>
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

      {/* Assign Plan Modal */}
      <Modal isOpen={showAssignPlanModal} onClose={() => setShowAssignPlanModal(false)} title={`Assign Plan to ${selectedClient?.company}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a plan to assign:</p>
          <div className="space-y-2">
            {subscriptionPlans.map((plan) => (
              <Button
                key={plan.name}
                variant="secondary"
                className="w-full justify-between"
                onClick={() => {
                  setSelectedPlan(plan.name);
                  if (plan.price > 0) {
                    processPayment(plan.name, plan.price);
                  } else {
                    assignPlan(selectedClient?.id || '', plan.name);
                  }
                }}
              >
                <span>{plan.name}</span>
                <span className="font-semibold">
                  {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                </span>
              </Button>
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setShowAssignPlanModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={showChangePlanModal} onClose={() => setShowChangePlanModal(false)} title={`Edit Plan for ${selectedClient?.name || selectedClient?.company}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Plan: <span className="font-semibold">{selectedClient?.currentPlan}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a new plan to upgrade or downgrade:</p>
          <div className="space-y-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-4 ${
                  plan.name === selectedClient?.currentPlan 
                    ? 'border-gray-300 bg-gray-50 dark:bg-gray-700' 
                    : 'border-gray-200 hover:border-blue-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                    {plan.name === selectedClient?.currentPlan && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Current</span>
                    )}
                  </h4>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${plan.price}/month
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-3 w-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.name !== selectedClient?.currentPlan && (
                  <Button
                    variant={plan.price > 0 ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => changePlan(selectedClient?.id || '', plan.name)}
                  >
                    {plan.price > 0 ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Select Plan & Pay ${plan.price}
                      </>
                    ) : (
                      `Switch to ${plan.name}`
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setShowChangePlanModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal>



      {/* Payment Processing Modal */}
      <Modal isOpen={showPaymentModal} onClose={closePaymentModal} title="Payment Processing">
        <div className="space-y-6 text-center">
          {paymentLoading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold">Processing Payment...</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we process your payment
                </p>
              </div>
            </div>
          ) : paymentResult ? (
            <div className="space-y-4">
              {paymentResult.success ? (
                <div className="space-y-3">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                      Payment Successful!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your subscription has been activated successfully.
                    </p>
                    {paymentResult.paymentId && (
                      <p className="text-xs text-gray-500 mt-2">
                        Payment ID: {paymentResult.paymentId}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                      Payment Failed
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paymentResult.error || 'Something went wrong. Please try again.'}
                    </p>
                  </div>
                </div>
              )}
              <Button onClick={closePaymentModal} className="w-full">
                {paymentResult.success ? 'Continue' : 'Try Again'}
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>

      {/* Admin Payment Modal */}
      <Modal isOpen={showAdminPaymentModal} onClose={() => setShowAdminPaymentModal(false)} title={`Process Payment for ${selectedClient?.name || selectedClient?.company}`}>
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Client Information</h4>
            <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <p><strong>Name:</strong> {selectedClient?.name || selectedClient?.company}</p>
              <p><strong>Email:</strong> {selectedClient?.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {selectedClient?.phone || 'Not provided'}</p>
              <p><strong>Current Plan:</strong> {selectedClient?.currentPlan}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Subscription Plan
              </label>
              <select
                value={adminPaymentData.plan}
                onChange={(e) => setAdminPaymentData({...adminPaymentData, plan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {subscriptionPlans.map((plan) => (
                  <option key={plan.name} value={plan.name}>
                    {plan.name} - ₹{plan.price}/month
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Duration (Months)
              </label>
              <select
                value={adminPaymentData.durationMonths}
                onChange={(e) => setAdminPaymentData({...adminPaymentData, durationMonths: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[1, 3, 6, 12].map((months) => (
                  <option key={months} value={months}>
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{(subscriptionPlans.find(p => p.name === adminPaymentData.plan)?.price || 0) * adminPaymentData.durationMonths}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Payment will be processed through Razorpay gateway
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => processAdminPayment(adminPaymentData.clientId, adminPaymentData.plan, adminPaymentData.durationMonths)}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <>
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Process Payment via Razorpay
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowAdminPaymentModal(false)}
              disabled={paymentLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};