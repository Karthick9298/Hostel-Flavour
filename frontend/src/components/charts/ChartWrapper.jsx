import React, { useState, useRef } from 'react';
import ChartControls from './ChartControls';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ChartWrapper = ({ 
  children, 
  title, 
  subtitle, 
  enableControls = true,
  enableExport = true,
  enableFullscreen = true,
  enableShare = true,
  enableFilter = false,
  showTypeSelector = false,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentChartType, setCurrentChartType] = useState('default');
  const chartRef = useRef(null);

  const handleExport = async (format = 'png') => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}_chart.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this chart: ${title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  const handleFilter = () => {
    // Implement filter logic
    console.log('Filter functionality to be implemented');
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleChangeTheme = (theme) => {
    setCurrentTheme(theme);
    // Apply theme changes to the chart
  };

  const handleChangeChartType = (type) => {
    setCurrentChartType(type);
    // Change chart type logic
  };

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
      ref={chartRef}
    >
      {enableControls && (
        <ChartControls
          onExport={() => handleExport('png')}
          onFullscreen={handleFullscreen}
          onShare={handleShare}
          onFilter={handleFilter}
          onToggleVisibility={handleToggleVisibility}
          onChangeTheme={handleChangeTheme}
          onChangeChartType={handleChangeChartType}
          isVisible={isVisible}
          isFullscreen={isFullscreen}
          currentTheme={currentTheme}
          currentChartType={currentChartType}
          showTypeSelector={showTypeSelector}
        />
      )}

      <div className="p-6">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}

        <div 
          className={`transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-30'
          } ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'}`}
        >
          {children}
        </div>
      </div>

      {isFullscreen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 -z-10" onClick={handleFullscreen} />
      )}
    </div>
  );
};

export default ChartWrapper;
