import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Shield, Users, Eye, Edit, Trash2, Plus } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'support' | 'tech' | 'sales' | 'admin';
  status: 'active' | 'inactive';
  lastActive: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  color: string;
}

export const RolesPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const roles: Role[] = [
    {
      id: 'support',
      name: 'Support Team',
      description: 'Handle customer inquiries and tickets',
      permissions: ['view_tickets', 'update_tickets', 'view_clients', 'chat_support'],
      memberCount: 8,
      color: 'blue'
    },
    {
      id: 'tech',
      name: 'Technical Team',
      description: 'Manage technical issues and integrations',
      permissions: ['view_all_data', 'manage_api', 'approve_tours', 'system_settings'],
      memberCount: 5,
      color: 'purple'
    },
    {
      id: 'sales',
      name: 'Sales Team',
      description: 'Handle client acquisition and onboarding',
      permissions: ['view_clients', 'manage_onboarding', 'view_analytics', 'billing_access'],
      memberCount: 6,
      color: 'green'
    },
    {
      id: 'admin',
      name: 'Administrators',
      description: 'Full system access and management',
      permissions: ['full_access', 'user_management', 'role_management', 'system_config'],
      memberCount: 3,
      color: 'red'
    }
  ];

  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@nisaa.com',
      role: 'support',
      status: 'active',
      lastActive: '2024-12-25T10:30:00Z',
      permissions: ['view_tickets', 'update_tickets', 'view_clients']
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@nisaa.com',
      role: 'tech',
      status: 'active',
      lastActive: '2024-12-24T15:45:00Z',
      permissions: ['view_all_data', 'manage_api', 'approve_tours']
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@nisaa.com',
      role: 'sales',
      status: 'active',
      lastActive: '2024-12-25T09:15:00Z',
      permissions: ['view_clients', 'manage_onboarding', 'billing_access']
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@nisaa.com',
      role: 'admin',
      status: 'active',
      lastActive: '2024-12-25T11:20:00Z',
      permissions: ['full_access', 'user_management', 'role_management']
    },
    {
      id: '5',
      name: 'Emma Brown',
      email: 'emma@nisaa.com',
      role: 'support',
      status: 'inactive',
      lastActive: '2024-12-20T14:30:00Z',
      permissions: ['view_tickets', 'update_tickets']
    }
  ];

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'tech':
        return 'info';
      case 'sales':
        return 'success';
      case 'support':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage staff roles and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className={`border-l-4 border-l-${role.color}-500`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${role.color}-50 dark:bg-${role.color}-900/30 rounded-lg`}>
                  <Shield className={`h-6 w-6 text-${role.color}-600`} />
                </div>
                <Badge variant={getRoleVariant(role.id)}>
                  {role.memberCount} members
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {role.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {role.description}
              </p>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Key Permissions
                </h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="default" size="sm">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Staff Members ({staffMembers.length})
            </h3>
            <div className="flex items-center space-x-4">
              <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Roles</option>
                <option>Support</option>
                <option>Technical</option>
                <option>Sales</option>
                <option>Admin</option>
              </select>
              <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {staffMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(member.status)}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {new Date(member.lastActive).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.slice(0, 2).map((permission) => (
                          <Badge key={permission} variant="default" size="sm">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {member.permissions.length > 2 && (
                          <Badge variant="default" size="sm">
                            +{member.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Staff Member Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Staff Member"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700">
              <option>Select Role</option>
              <option>Support</option>
              <option>Technical</option>
              <option>Sales</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="flex space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={() => setShowCreateModal(false)} className="flex-1">
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Member Detail Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title={`Staff Details - ${selectedMember?.name}`}
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedMember.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedMember.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={getRoleVariant(selectedMember.role)}>
                      {selectedMember.role}
                    </Badge>
                    <Badge variant={getStatusVariant(selectedMember.status)}>
                      {selectedMember.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Permissions</h5>
              <div className="flex flex-wrap gap-2">
                {selectedMember.permissions.map((permission) => (
                  <Badge key={permission} variant="default">
                    {permission.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Last Active:</span>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedMember.lastActive).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Member ID:</span>
                <p className="text-gray-600 dark:text-gray-400">{selectedMember.id}</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowMemberModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button className="flex-1">
                Edit Member
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};