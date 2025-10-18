import React, { useState } from 'react';
import { 
  FaDownload, 
  FaExpand, 
  FaCompress, 
  FaCog, 
  FaShareAlt,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaPalette,
  FaChartBar,
  FaChartPie,
  FaChartLine
} from 'react-icons/fa';

const ChartControls = ({ 
  onExport, 
  onFullscreen, 
  onShare, 
  onFilter,
  onToggleVisibility,
  onChangeTheme,
  onChangeChartType,
  isVisible = true,
  isFullscreen = false,
  currentTheme = 'default',
  currentChartType = 'default',
  showTypeSelector = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showTypes, setShowTypes] = useState(false);

  const themes = [
    { id: 'default', name: 'Default', colors: ['#3B82F6', '#10B981', '#F59E0B'] },
    { id: 'dark', name: 'Dark Mode', colors: ['#1F2937', '#374151', '#6B7280'] },
    { id: 'vibrant', name: 'Vibrant', colors: ['#EC4899', '#8B5CF6', '#06B6D4'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#000000', '#4B5563', '#9CA3AF'] },
    { id: 'sunset', name: 'Sunset', colors: ['#F97316', '#EF4444', '#DC2626'] }
  ];

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: FaChartBar },
    { id: 'line', name: 'Line Chart', icon: FaChartLine },
    { id: 'pie', name: 'Pie Chart', icon: FaChartPie }
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex items-center space-x-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
        {/* Visibility Toggle */}
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded-md transition-colors ${
            isVisible 
              ? 'text-blue-600 hover:bg-blue-50' 
              : 'text-gray-400 hover:bg-gray-50'
          }`}
          title={isVisible ? 'Hide Chart' : 'Show Chart'}
        >
          {isVisible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
        </button>

        {/* Chart Type Selector */}
        {showTypeSelector && (
          <div className="relative">
            <button
              onClick={() => setShowTypes(!showTypes)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
              title="Change Chart Type"
            >
              <FaChartBar size={14} />
            </button>
            {showTypes && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 z-20">
                {chartTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      onChangeChartType(type.id);
                      setShowTypes(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                      currentChartType === type.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <type.icon size={14} />
                    <span className="text-sm">{type.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemes(!showThemes)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            title="Change Theme"
          >
            <FaPalette size={14} />
          </button>
          {showThemes && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 z-20">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onChangeTheme(theme.id);
                    setShowThemes(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                    currentTheme === theme.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <span className="text-sm">{theme.name}</span>
                  <div className="flex space-x-1">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <button
          onClick={onFilter}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          title="Filter Data"
        >
          <FaFilter size={14} />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          title="Export Chart"
        >
          <FaDownload size={14} />
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          title="Share Chart"
        >
          <FaShareAlt size={14} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onFullscreen}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
        </button>

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            title="Chart Settings"
          >
            <FaCog size={14} />
          </button>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 z-20">
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Chart Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="text-sm text-gray-700">Show Grid Lines</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="text-sm text-gray-700">Show Legend</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-sm text-gray-700">Show Values</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="text-sm text-gray-700">Animate</span>
                  </label>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Export Format</h4>
                <div className="space-y-1">
                  <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    PNG Image
                  </button>
                  <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    PDF Document
                  </button>
                  <button className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    CSV Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;
