import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { Users, DollarSign, UserCheck, UserX, Calendar, Target } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Select } from "../components/ui/Select";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ----- Stat Card Component -----
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="shadow-sm hover:shadow-md transition">
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/30`}>{icon}</div>
    </CardContent>
  </Card>
);

// ----- Dashboard Page -----
export const DashboardPage: React.FC = () => {
  const timeOptions = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  const [revenuePeriod, setRevenuePeriod] = useState("month");
  const [signupPeriod, setSignupPeriod] = useState("month");
  const [industryPeriod, setIndustryPeriod] = useState("month");
  const [leadPeriod, setLeadPeriod] = useState("month");

  const recentClients = [
    { id: 1, name: "TechNova", status: "Active" },
    { id: 2, name: "Medilife", status: "Pending" },
    { id: 3, name: "Greenfield Travels", status: "Active" },
    { id: 4, name: "EduCore", status: "Inactive" },
    { id: 5, name: "RealHub Estates", status: "Active" },
  ];

  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 21000 },
    { month: "May", revenue: 25000 },
    { month: "Jun", revenue: 28000 },
  ];

  const signupData = [
    { month: "Jan", signups: 45 },
    { month: "Feb", signups: 60 },
    { month: "Mar", signups: 75 },
    { month: "Apr", signups: 90 },
    { month: "May", signups: 110 },
    { month: "Jun", signups: 130 },
  ];

  const industryUsage = [
    { name: "Hospitality", value: 400 },
    { name: "Education", value: 300 },
    { name: "Healthcare", value: 300 },
    { name: "Real Estate", value: 200 },
  ];

  const leadStats = [
    { source: "Website", leads: 160 },
    { source: "Referrals", leads: 120 },
    { source: "Email", leads: 90 },
    { source: "Social Media", leads: 140 },
  ];

  const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of all clients, revenue, and performance metrics.
        </p>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Clients" value="250" color="blue" icon={<Users className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Active Clients" value="180" color="green" icon={<UserCheck className="h-6 w-6 text-green-600" />} />
        <StatCard title="Inactive Clients" value="70" color="red" icon={<UserX className="h-6 w-6 text-red-600" />} />
        <StatCard title="Total Revenue" value="$120,000" color="yellow" icon={<DollarSign className="h-6 w-6 text-yellow-600" />} />
        <StatCard title="Total Leads" value="320" color="purple" icon={<Target className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Appointments" value="45" color="indigo" icon={<Calendar className="h-6 w-6 text-indigo-600" />} />
      </div>

      {/* Recent Clients */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Clients</h3>
          <button className="text-sm text-blue-600 hover:underline">View All</button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentClients.map((client) => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                <Badge
                  variant={
                    client.status === "Active"
                      ? "success"
                      : client.status === "Pending"
                      ? "warning"
                      : "default"
                  }
                >
                  {client.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader className="flex justify-between items-center relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h3>
            <div className="relative z-50">
              <Select options={timeOptions} value={revenuePeriod} onChange={setRevenuePeriod} />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} />
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* New Signups */}
        <Card>
          <CardHeader className="flex justify-between items-center relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Signups</h3>
            <div className="relative z-50">
              <Select options={timeOptions} value={signupPeriod} onChange={setSignupPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="signups" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Usage */}
        <Card>
          <CardHeader className="flex justify-between items-center relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Industry Usage</h3>
            <div className="relative z-50">
              <Select options={timeOptions} value={industryPeriod} onChange={setIndustryPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={industryUsage} dataKey="value" nameKey="name" outerRadius={80} label>
                  {industryUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Generation Stats */}
        <Card>
          <CardHeader className="flex justify-between items-center relative">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Generation Stats</h3>
            <div className="relative z-50">
              <Select options={timeOptions} value={leadPeriod} onChange={setLeadPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
