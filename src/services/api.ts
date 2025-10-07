// src/services/api.ts
import type { 
  Client, 
  Ticket, 
  Tour, 
  Scene, 
  Hotspot, 
  Invoice, 
  AnalyticsData 
} from '../types';
import { mockClients, mockTickets, mockInvoices, mockAnalytics } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

// -----------------------------------------------------------------------------
// Automatically assign 5 images per client from public/images
// -----------------------------------------------------------------------------
const officeImages = Array.from({ length: 16 }, (_, i) => `/images/office-${i + 1}.jpg`);

// -----------------------------------------------------------------------------
// Internal Mock Tours Data
// -----------------------------------------------------------------------------
const tours: Tour[] = mockClients.map((client, idx) => {
  const startImage = idx * 5; // each client gets 5 images
  const scenes: Scene[] = [];

  for (let i = 0; i < 5; i++) {
    const imageIndex = startImage + i;
    if (imageIndex >= officeImages.length) break;
    scenes.push({
      id: uuidv4(),
      tourId: `tour-${client.id}`,
      title: `Scene ${i + 1}`,
      imageUrl: officeImages[imageIndex],
      uploadDate: new Date().toISOString(),
      size: 1.0,
      bandwidth: 100,
      hotspots: [],
    });
  }

  return {
    id: `tour-${client.id}`,
    clientId: client.id,
    clientName: client.name,
    title: `${client.name} 360° Tour`,
    status: 'approved',
    uploadDate: new Date().toISOString(),
    size: scenes.length,
    bandwidth: scenes.length * 100,
    scenes,
  };
});

// -----------------------------------------------------------------------------
// Helper: simulate delay
// -----------------------------------------------------------------------------
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// -----------------------------------------------------------------------------
// CLIENT SUBSCRIPTIONS
// -----------------------------------------------------------------------------
interface Subscription {
  clientId: string;
  plan: string;
}
const clientSubscriptions: Subscription[] = mockClients.map(c => ({
  clientId: c.id,
  plan: c.currentPlan || 'Free',
}));

// -----------------------------------------------------------------------------
// API Implementation
// -----------------------------------------------------------------------------
export const api = {
  // ---------------- CLIENT ----------------
  async getClients(): Promise<Client[]> {
    await delay(500);
    return JSON.parse(JSON.stringify(mockClients));
  },

  async updateClientStatus(id: string, status: Client['status']): Promise<void> {
    await delay(300);
    const client = mockClients.find(c => c.id === id);
    if (client) client.status = status;
  },

  async generateApiKey(clientId: string): Promise<string> {
    await delay(500);
    const apiKey = `${clientId}_sk_${Math.random().toString(36).substring(2, 15)}`;
    const client = mockClients.find(c => c.id === clientId);
    if (client) client.apiKey = apiKey;
    return apiKey;
  },

  async addClient(newClient: Omit<Client, 'id' | 'apiKey' | 'currentUsage'>): Promise<Client> {
    await delay(400);
    const client: Client = {
      ...newClient,
      id: uuidv4(),
      apiKey: `${newClient.name.toLowerCase().replace(/\s+/g, '-')}_sk_${Math.random().toString(36).substring(2, 15)}`,
      currentUsage: 0,
      usageLimit: newClient.usageLimit ?? 10000,
      createdAt: new Date().toISOString(),
    };
    mockClients.push(client);
    clientSubscriptions.push({ clientId: client.id, plan: 'Free' });
    return JSON.parse(JSON.stringify(client));
  },

  // ---------------- TICKET ----------------
  async getTickets(): Promise<Ticket[]> {
    await delay(500);
    return JSON.parse(JSON.stringify(mockTickets));
  },

  async updateTicketStatus(id: string, status: Ticket['status']): Promise<void> {
    await delay(300);
    const ticket = mockTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
    }
  },

  async createTicket(newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    await delay(400);
    const ticket: Ticket = {
      ...newTicket,
      id: `tkt_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTickets.push(ticket);
    return JSON.parse(JSON.stringify(ticket));
  },
  async assignTicket(ticketId: string, assignedTo: string): Promise<void> {
  await delay(200); // simulate async call
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');
  ticket.assignedTo = assignedTo; // make sure assignedTo in Ticket type is string | undefined
},

  // ---------------- TOUR ----------------
  async getTours(): Promise<Tour[]> {
    await delay(300);
    return JSON.parse(JSON.stringify(tours));
  },

  async getTourById(tourId: string): Promise<Tour | undefined> {
    await delay(200);
    return JSON.parse(JSON.stringify(tours.find(t => t.id === tourId)));
  },

  async createScene(tourId: string, scene: Partial<Scene>): Promise<Scene> {
    await delay(200);
    const newScene: Scene = {
      id: uuidv4(),
      tourId,
      title: scene.title || 'Untitled Scene',
      imageUrl: scene.imageUrl || '',
      uploadDate: new Date().toISOString(),
      size: scene.size || 0,
      bandwidth: scene.bandwidth || 0,
      hotspots: [],
    };
    const t = tours.find(x => x.id === tourId);
    if (!t) throw new Error('Tour not found');
    t.scenes.push(newScene);
    return JSON.parse(JSON.stringify(newScene));
  },

  async createHotspot(hs: Partial<Hotspot>): Promise<Hotspot> {
    await delay(150);
    const newHs: Hotspot = {
      id: uuidv4(),
      sceneId: hs.sceneId!,
      yaw: hs.yaw ?? 0,
      pitch: hs.pitch ?? 0,
      title: hs.title || '',
      description: hs.description || '',
      targetSceneId: hs.targetSceneId ?? null,
    };
    const scene = tours.flatMap(t => t.scenes).find(s => s.id === newHs.sceneId);
    if (!scene) throw new Error('Scene not found');
    scene.hotspots.push(newHs);
    return JSON.parse(JSON.stringify(newHs));
  },

  async deleteHotspot(hotspotId: string): Promise<void> {
    await delay(120);
    for (const t of tours) {
      for (const s of t.scenes) {
        const idx = s.hotspots.findIndex(h => h.id === hotspotId);
        if (idx >= 0) {
          s.hotspots.splice(idx, 1);
          return;
        }
      }
    }
  },

  async approveTour(id: string): Promise<void> {
    await delay(300);
    const tour = tours.find(t => t.id === id);
    if (tour) tour.status = 'approved';
  },

  async rejectTour(id: string): Promise<void> {
    await delay(300);
    const tour = tours.find(t => t.id === id);
    if (tour) tour.status = 'rejected';
  },

  // ---------------- CLIENT SUBSCRIPTIONS ----------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getClientSubscriptions(): Promise<any[]> {
    await delay(400);
    return mockClients.map(c => ({
      ...c,
      currentPlan: clientSubscriptions.find(s => s.clientId === c.id)?.plan || 'Free',
    }));
  },

  async assignPlan(clientId: string, plan: string): Promise<void> {
    await delay(300);
    const sub = clientSubscriptions.find(s => s.clientId === clientId);
    if (sub) sub.plan = plan;
    const client = mockClients.find(c => c.id === clientId);
    if (client) client.currentPlan = plan;
  },

  async changePlan(clientId: string, plan: string): Promise<void> {
    await delay(300);
    const sub = clientSubscriptions.find(s => s.clientId === clientId);
    if (sub) sub.plan = plan;
    const client = mockClients.find(c => c.id === clientId);
    if (client) client.currentPlan = plan;
  },

  async cancelSubscription(clientId: string): Promise<void> {
    await delay(300);
    const sub = clientSubscriptions.find(s => s.clientId === clientId);
    if (sub) sub.plan = 'Free';
    const client = mockClients.find(c => c.id === clientId);
    if (client) {
      client.currentPlan = 'Free';
      client.status = 'inactive';
    }
  },

  // ---------------- INVOICES & ANALYTICS ----------------
  async getInvoices(): Promise<Invoice[]> {
    await delay(500);
    return JSON.parse(JSON.stringify(mockInvoices));
  },

  async getAnalytics(): Promise<AnalyticsData[]> {
    await delay(500);
    return JSON.parse(JSON.stringify(mockAnalytics));
  },
};
