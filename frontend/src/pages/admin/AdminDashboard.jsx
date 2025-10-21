import React, { useState } from 'react';
import DailyAnalysisDashboard from './DashboardDaily';
import WeeklyAnalysisDashboard from './WeeklyAnalysis';
import { 
  FaCalendarDay, 
  FaCalendarWeek,
  FaChartBar,
  FaCog
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('daily');

  const tabs = [
    {
      id: 'daily',
      label: 'Daily Analysis',
      icon: FaCalendarDay,
      description: 'Detailed daily feedback analysis'
    },
    {
      id: 'weekly',
      label: 'Weekly Analysis', 
      icon: FaCalendarWeek,
      description: 'Weekly trends and patterns'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaChartBar className="text-xl text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Hostel Food Analysis & Insights</p>
              </div>
            </div>
            
            {/* Tab Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      activeView === tab.id
                        ? 'bg-white text-indigo-600 shadow-sm font-medium'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                    title={tab.description}
                  >
                    <IconComponent className="text-lg" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeView === 'daily' && <DailyAnalysisDashboard />}
        {activeView === 'weekly' && <WeeklyAnalysisDashboard />}
      </div>

      {/* Quick Stats Overlay (when switching tabs) */}
      <div className="fixed bottom-6 right-6 z-20">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${
              activeView === 'daily' ? 'bg-green-500' : 'bg-indigo-500'
            }`}></div>
            <span className="font-medium">
              {activeView === 'daily' ? 'Daily View' : 'Weekly View'} Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
