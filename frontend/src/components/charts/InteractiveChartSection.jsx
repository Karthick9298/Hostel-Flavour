import React, { useState } from 'react';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine, 
  FaChartArea,
  FaExpand,
  FaCompress,
  FaDownload,
  FaShare,
  FaFilter,
  FaCog,
  FaEye,
  FaRandom,
  FaSync
} from 'react-icons/fa';

const InteractiveChartSection = ({ 
  title, 
  subtitle, 
  children, 
  defaultExpanded = false,
  showControls = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'carousel'

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exportSection = () => {
    // Export functionality
    console.log('Exporting section:', title);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''
      } ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleExpanded}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaChartBar size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaChartLine size={14} />
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'carousel' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaChartPie size={14} />
              </button>
            </div>

            {/* Action Buttons */}
            <button 
              onClick={exportSection}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Export Section"
            >
              <FaDownload size={14} />
            </button>
            <button 
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Share Section"
            >
              <FaShare size={14} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-96 overflow-hidden'}`}>
        <div className={`p-6 ${
          viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 
          viewMode === 'list' ? 'space-y-6' : 
          'flex overflow-x-auto space-x-6'
        }`}>
          {children}
        </div>
      </div>

      {/* Expand/Collapse Footer */}
      {!isExpanded && (
        <div className="text-center p-4 border-t border-gray-100">
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2 mx-auto"
          >
            <span>View All Charts</span>
            <FaExpand size={12} />
          </button>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={toggleFullscreen} />
      )}
    </div>
  );
};

export default InteractiveChartSection;
