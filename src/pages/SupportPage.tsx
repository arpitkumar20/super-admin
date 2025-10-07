import React, { useState, useEffect } from 'react';
import { Card, } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import type { Ticket } from '../types';
import { MessageCircle, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { useTheme } from "../contexts/ThemeContext";

const staffMembers = [
  { email: 'john.doe@example.com', name: 'John Doe' },
  { email: 'jane.smith@example.com', name: 'Jane Smith' },
  { email: 'mike.johnson@example.com', name: 'Mike Johnson' },
  { email: 'unassigned', name: 'Unassigned' },
];

export const SupportPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('unassigned');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    type: 'General',
    clientName: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      await api.updateTicketStatus(ticketId, status);
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket
        )
      );
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const assignTicket = async (ticketId: string, assignee: string) => {
    try {
      await api.assignTicket(ticketId, assignee);

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, assignedTo: clientId ?? undefined } : t
        )
      );
      setShowAssignModal(false);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim() || !newTicket.clientName.trim()) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      const created = await api.createTicket(newTicket);
      setTickets(prev => [created, ...prev]);
      setShowAddTicketModal(false);
      setNewTicket({ subject: '', description: '', priority: 'medium', type: 'General', clientName: '' });
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const getStatusVariant = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <MessageCircle className="h-5 w-5" />;
      case 'in_progress': return <Clock className="h-5 w-5" />;
      case 'resolved': return <CheckCircle className="h-5 w-5" />;
      case 'closed': return <XCircle className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
        Loading support tickets...
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} p-6 space-y-6 min-h-screen`}>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support Desk</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage customer support tickets efficiently</p>
        </div>
        <Button onClick={() => setShowAddTicketModal(true)}>Create Ticket</Button>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Open', 'In Progress', 'Resolved', 'Closed'].map((status, idx) => (
          <Card key={status} className="p-4 text-center">
            <p className="text-sm text-gray-500">{status}</p>
            <p className="text-2xl font-bold">{Object.values({
              open: tickets.filter(t => t.status === 'open').length,
              in_progress: tickets.filter(t => t.status === 'in_progress').length,
              resolved: tickets.filter(t => t.status === 'resolved').length,
              closed: tickets.filter(t => t.status === 'closed').length,
            })[idx]}</p>
          </Card>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(ticket => (
          <Card key={ticket.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md hover:shadow-xl transition p-4 flex flex-col justify-between`}>

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">#{ticket.id} - {ticket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(ticket.status)}
                  <Badge variant={getStatusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{ticket.assignedTo ? staffMembers.find(s => s.email === ticket.assignedTo)?.name : 'Unassigned'}</span>
              </div>
            </div>

            {/* Description */}
            <p className={`mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{ticket.description}</p>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => updateTicketStatus(ticket.id, 'open')}>Not Solved</Button>
                <Button size="sm" variant="warning" onClick={() => updateTicketStatus(ticket.id, 'in_progress')}>Ongoing</Button>
                <Button size="sm" variant="primary" onClick={() => updateTicketStatus(ticket.id, 'resolved')}>Solved</Button>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setSelectedTicket(ticket); setShowTicketModal(true); }}>View</Button>
                <Button size="sm" variant="outline" onClick={() => { setSelectedTicket(ticket); setSelectedAssignee(ticket.assignedTo || 'unassigned'); setShowAssignModal(true); }}>Assign</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title={`Ticket #${selectedTicket?.id}`}
      >
        {selectedTicket && (
          <div className="space-y-4 text-sm">
            <h4 className="font-semibold text-lg">{selectedTicket.subject}</h4>
            <p>{selectedTicket.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Client:</strong> {selectedTicket.clientName}</p>
              <p><strong>Type:</strong> {selectedTicket.type}</p>
              <p><strong>Status:</strong> {selectedTicket.status}</p>
              <p><strong>Priority:</strong> {selectedTicket.priority}</p>
              <p><strong>Assigned To:</strong> {selectedTicket.assignedTo ? staffMembers.find(s => s.email === selectedTicket.assignedTo)?.name : 'Unassigned'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Staff Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Ticket #${selectedTicket?.id}`}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Select Staff</label>
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="w-full border rounded-md p-2 text-sm text-black" // text always black
            >
              {staffMembers.map(staff => (
                <option key={staff.email} value={staff.email}>{staff.name}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button onClick={() => { if (selectedTicket) assignTicket(selectedTicket.id, selectedAssignee); }}>Assign</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Ticket Modal */}
      <Modal
        isOpen={showAddTicketModal}
        onClose={() => setShowAddTicketModal(false)}
        title="Create New Ticket"
      >
        <div className="space-y-4">
          {['Subject', 'Description', 'Client Name'].map((label, idx) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              {label === 'Description' ? (
                <textarea
                  value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-md p-2 text-sm text-black" // text always black
                />
              ) : (
                <input
                  type="text"
                  value={idx === 0 ? newTicket.subject : newTicket.clientName}
                  onChange={e => setNewTicket({ ...newTicket, [idx === 0 ? 'subject' : 'clientName']: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm text-black" // text always black
                />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={newTicket.priority}
                onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full border rounded-md p-2 text-sm text-black" // text always black
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <input
                type="text"
                value={newTicket.type}
                onChange={e => setNewTicket({ ...newTicket, type: e.target.value })}
                className="w-full border rounded-md p-2 text-sm text-black" // text always black
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={() => setShowAddTicketModal(false)}>Cancel</Button>
            <Button onClick={createTicket}>Create</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
