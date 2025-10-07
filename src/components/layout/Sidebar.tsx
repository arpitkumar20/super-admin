import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Camera,
  HeadphonesIcon,
  BarChart3,
  Shield
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Users, label: 'Client Management' },
  { path: '/onboarding', icon: UserPlus, label: 'Client Onboarding' },
  { path: '/billing', icon: CreditCard, label: 'Billing & Payments' },
  { path: '/tours', icon: Camera, label: '360° Tour Management' },
  { path: '/support', icon: HeadphonesIcon, label: 'Support Desk' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/roles', icon: Shield, label: 'Role Management' }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen w-64 flex flex-col flex-shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">NISAA</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center px-3 py-2 rounded-lg transition-colors duration-200 w-full h-12 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r" />
              )}

              {/* Icon & Label */}
              <Icon className="h-5 w-5 flex-shrink-0 ml-4" />
              <span className="font-medium ml-3">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
