import { ReactNode } from "react";

// ------------------------------------
// USER TYPES
// ------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "support" | "tech" | "sales";
  avatar?: string;
}

// ------------------------------------
// CLIENT TYPES
// ------------------------------------

// Document or uploaded file
export interface DocumentFile {
  id?: string;
  name: string;
  type: string;
  file?: File; // Used when uploading a new document
  url?: string; // Returned from backend
}

// Backend-supported connector types
export type ConnectorType = "zoho" | "postgresql" | "" | null;

// Connector config (for connectors like Zoho, PostgreSQL, etc.)
export interface ConnectorConfig {
  region?: string;
  access_key?: string;
  secret_key?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Main client interface
export interface Client {
  id?: string; // optional for new clients
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  clientRef?: string;
  urls: string[];

  // Backend expects connector_type & config as form-data
  connector?: ConnectorType;
  has_connector?: boolean;
  config?: ConnectorConfig;

  // Logo can be a file or URL string
  logo?: File | string | null;

  // Documents array, can contain File objects or existing metadata
  documents: (DocumentFile | File)[];

  // Backend supports only these statuses
  status: "active" | "pending" | "approved" | "rejected";

  // Additional optional info
  company?: string;
  industry?: string;
  contactPerson?: string;
  currentPlan?: "Free" | "Premium" | "Enterprise";

  // Optional fields used by ClientsPage and other UIs (safe defaults applied in api.getClients)
  subscription?: "basic" | "premium" | "enterprise";
  currentUsage?: number;
  usageLimit?: number;
  apiKey?: string;
  website?: string;
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
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
};

// ------------------------------------
// TOUR TYPES (360° VIEW SYSTEM)
// ------------------------------------
export interface Hotspot {
  id: string;
  title: string;
  yaw: number;
  pitch: number;
  sceneId: string;
  type?: "info" | "scene";
}

export interface Scene {
  id: string;
  title: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

export interface Tour {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  status: "pending" | "approved" | "rejected" | "live";
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
  status: "paid" | "pending" | "overdue";
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
