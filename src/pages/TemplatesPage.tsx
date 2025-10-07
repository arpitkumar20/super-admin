import React from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Heart, Building, GraduationCap, Home, Settings, Users, FileText, Zap } from 'lucide-react';

const IndustryTemplate: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  clientCount: number;
  workflows: string[];
  color: string;
}> = ({ icon, title, description, clientCount, workflows, color }) => (
  <Card className={`hover:shadow-md transition-all duration-200 border-l-4 border-l-${color}-500`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <Badge variant="info">{clientCount} clients</Badge>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Available Workflows:</h4>
        <div className="flex flex-wrap gap-2">
          {workflows.map((workflow, index) => (
            <Badge key={index} variant="default" size="sm">
              {workflow}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
        <Button size="sm">
          View Templates
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const TemplatesPage: React.FC = () => {
  const industryTemplates = [
    {
      icon: <Heart className="h-6 w-6 text-blue-600" />,
      title: 'Healthcare',
      description: 'Medical facilities, clinics, and hospitals',
      clientCount: 28,
      workflows: ['Patient Onboarding', 'Facility Tour', 'Equipment Demo', 'Department Overview'],
      color: 'blue'
    },
    {
      icon: <Building className="h-6 w-6 text-purple-600" />,
      title: 'Hospitality',
      description: 'Hotels, restaurants, and event venues',
      clientCount: 35,
      workflows: ['Property Showcase', 'Room Tours', 'Event Spaces', 'Amenities Display'],
      color: 'purple'
    },
    {
      icon: <Home className="h-6 w-6 text-green-600" />,
      title: 'Real Estate',
      description: 'Properties, showrooms, and developments',
      clientCount: 42,
      workflows: ['Property Listing', 'Virtual Staging', 'Neighborhood Tour', 'Investment Overview'],
      color: 'green'
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-orange-600" />,
      title: 'Education',
      description: 'Schools, universities, and training centers',
      clientCount: 19,
      workflows: ['Campus Tour', 'Classroom Demo', 'Lab Showcase', 'Student Life'],
      color: 'orange'
    }
  ];

  const templateFeatures = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: 'User Management',
      description: 'Role-based access control and user permissions'
    },
    {
      icon: <FileText className="h-6 w-6 text-green-600" />,
      title: 'Document Templates',
      description: 'Pre-built forms and documentation workflows'
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-600" />,
      title: 'Automation',
      description: 'Automated workflows and notification systems'
    },
    {
      icon: <Settings className="h-6 w-6 text-orange-600" />,
      title: 'Customization',
      description: 'Flexible templates that adapt to client needs'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Industry Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage industry-specific workflows and templates</p>
        </div>
        <Button>Create New Template</Button>
      </div>

      {/* Template Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template System Overview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Industry-specific templates provide pre-configured workflows for faster client onboarding
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templateFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3 inline-flex">
                  {feature.icon}
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Templates */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Industry-Specific Templates</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {industryTemplates.map((template, index) => (
            <IndustryTemplate
              key={index}
              icon={template.icon}
              title={template.title}
              description={template.description}
              clientCount={template.clientCount}
              workflows={template.workflows}
              color={template.color}
            />
          ))}
        </div>
      </div>

      {/* Template Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Usage Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">124</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Active Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Client Adoption Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.3x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Faster Onboarding</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Popular Templates</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[
              { name: 'Healthcare Patient Onboarding', usage: 45, industry: 'Healthcare' },
              { name: 'Hotel Property Showcase', usage: 38, industry: 'Hospitality' },
              { name: 'Real Estate Virtual Staging', usage: 35, industry: 'Real Estate' },
              { name: 'University Campus Tour', usage: 22, industry: 'Education' },
              { name: 'Medical Equipment Demo', usage: 18, industry: 'Healthcare' }
            ].map((template, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  index !== 4 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {template.industry}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {template.usage} uses
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(template.usage / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};