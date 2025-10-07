import { ReactNode } from "react";

// ------------------------------------
// USER TYPES
// ------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support' | 'tech' | 'sales';
  avatar?: string;
}

// ------------------------------------
// CLIENT TYPES
// ------------------------------------
export interface Client {
  currentPlan: string;
  contactPerson: ReactNode;
  website?: string;
  id: string;
  name: string;
  email: string;
  company: string;
  industry: 'healthcare' | 'hospitality' | 'real_estate' | 'education';
  status: 'active' | 'inactive' | 'pending';
  subscription: 'basic' | 'premium' | 'enterprise';
  apiKey?: string;
  usageLimit: number;
  currentUsage: number;
  joinedDate: string;
  lastActive: string;
}

// ------------------------------------
// SUPPORT TICKET TYPES
// ------------------------------------
export type Ticket = {
  type: ReactNode;
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // optional string
}

// ------------------------------------
// TOUR TYPES (360° VIEW SYSTEM)
// ------------------------------------

// Hotspot (interactive marker in a scene)
export interface Hotspot {
  id: string;
  title: string;
  yaw: number;
  pitch: number;
  sceneId: string;
  type?: 'info' | 'scene';
}

// Scene (single 360° image with hotspots)
export interface Scene {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

// Tour containing multiple scenes
export interface Tour {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'live';
  uploadDate: string;
  size: number;
  bandwidth: number;
  scenes: Scene[];
}

// ------------------------------------
// INVOICE TYPES
// ------------------------------------
export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

// ------------------------------------
// ANALYTICS TYPES
// ------------------------------------
export interface AnalyticsData {
  period: string;
  clients: number;
  revenue: number;
  tours: number;
  bandwidth: number;
}

// ------------------------------------
// 360° PREVIEW COMPONENT STATE
// ------------------------------------
export interface TourPreviewState {
  currentScene?: Scene;
  isPreviewing: boolean;
  activeHotspot?: Hotspot;
  clientName?: string;
}
