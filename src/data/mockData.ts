import type { Client, Ticket, Tour, Invoice, AnalyticsData } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah@healthcareplus.com',
    company: 'HealthcarePlus Clinic',
    industry: 'healthcare',
    status: 'active',
    subscription: 'premium',
    apiKey: 'hcp_sk_1234567890abcdef',
    usageLimit: 10000,
    currentUsage: 7500,
    joinedDate: '2024-01-15',
    lastActive: '2024-12-25'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@grandhotels.com',
    company: 'Grand Hotels Group',
    industry: 'hospitality',
    status: 'active',
    subscription: 'enterprise',
    apiKey: 'ghg_sk_abcdef1234567890',
    usageLimit: 50000,
    currentUsage: 32000,
    joinedDate: '2024-02-20',
    lastActive: '2024-12-24'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@primerealty.com',
    company: 'Prime Realty Solutions',
    industry: 'real_estate',
    status: 'pending',
    subscription: 'basic',
    usageLimit: 5000,
    currentUsage: 0,
    joinedDate: '2024-12-20',
    lastActive: '2024-12-22'
  },
  {
    id: '4',
    name: 'Prof. David Kim',
    email: 'david@techuniversity.edu',
    company: 'Tech University',
    industry: 'education',
    status: 'active',
    subscription: 'premium',
    apiKey: 'tu_sk_fedcba0987654321',
    usageLimit: 25000,
    currentUsage: 18000,
    joinedDate: '2024-03-10',
    lastActive: '2024-12-23'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa@modernclinics.com',
    company: 'Modern Medical Clinics',
    industry: 'healthcare',
    status: 'inactive',
    subscription: 'basic',
    usageLimit: 5000,
    currentUsage: 2000,
    joinedDate: '2024-01-05',
    lastActive: '2024-11-15'
  }
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'HealthcarePlus Clinic',
    subject: 'API Integration Issues',
    description: 'Having trouble integrating the 360° tour API with our patient portal system.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Tech Support',
    createdAt: '2024-12-20T10:30:00Z',
    updatedAt: '2024-12-24T14:15:00Z'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Grand Hotels Group',
    subject: 'Bandwidth Limit Reached',
    description: 'We\'ve exceeded our monthly bandwidth allocation and need to discuss upgrading.',
    status: 'open',
    priority: 'medium',
    createdAt: '2024-12-22T09:15:00Z',
    updatedAt: '2024-12-22T09:15:00Z'
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Tech University',
    subject: 'New Campus Tour Request',
    description: 'We need to create virtual tours for our new engineering building and library.',
    status: 'resolved',
    priority: 'low',
    assignedTo: 'Sales Team',
    createdAt: '2024-12-18T16:20:00Z',
    updatedAt: '2024-12-21T11:30:00Z'
  }
];

export const mockTours: Tour[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'HealthcarePlus Clinic',
    title: 'Main Reception & Waiting Area',
    status: 'live',
    uploadDate: '2024-12-15',
    size: 2.5,
    bandwidth: 1250
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Grand Hotels Group',
    title: 'Presidential Suite Virtual Experience',
    status: 'pending',
    uploadDate: '2024-12-23',
    size: 5.2,
    bandwidth: 0
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Tech University',
    title: 'Engineering Lab Complex',
    status: 'approved',
    uploadDate: '2024-12-20',
    size: 3.8,
    bandwidth: 950
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'HealthcarePlus Clinic',
    amount: 299,
    status: 'paid',
    dueDate: '2024-12-15',
    paidDate: '2024-12-10'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Grand Hotels Group',
    amount: 899,
    status: 'paid',
    dueDate: '2024-12-20',
    paidDate: '2024-12-18'
  },
  {
    id: '3',
    clientId: '4',
    clientName: 'Tech University',
    amount: 499,
    status: 'pending',
    dueDate: '2025-01-10'
  }
];

export const mockAnalytics: AnalyticsData[] = [
  { period: 'Jan', clients: 45, revenue: 15000, tours: 120, bandwidth: 2500 },
  { period: 'Feb', clients: 52, revenue: 18500, tours: 145, bandwidth: 3200 },
  { period: 'Mar', clients: 48, revenue: 16800, tours: 135, bandwidth: 2800 },
  { period: 'Apr', clients: 61, revenue: 22000, tours: 180, bandwidth: 4100 },
  { period: 'May', clients: 58, revenue: 20500, tours: 165, bandwidth: 3700 },
  { period: 'Jun', clients: 67, revenue: 25200, tours: 200, bandwidth: 4800 },
  { period: 'Jul', clients: 72, revenue: 28000, tours: 220, bandwidth: 5200 },
  { period: 'Aug', clients: 69, revenue: 26500, tours: 210, bandwidth: 4900 },
  { period: 'Sep', clients: 74, revenue: 29800, tours: 235, bandwidth: 5600 },
  { period: 'Oct', clients: 78, revenue: 32000, tours: 250, bandwidth: 6000 },
  { period: 'Nov', clients: 82, revenue: 35500, tours: 275, bandwidth: 6800 },
  { period: 'Dec', clients: 89, revenue: 39000, tours: 300, bandwidth: 7500 }
];