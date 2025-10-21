import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y}/5`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 5,
      ticks: {
        stepSize: 0.5,
        color: '#6B7280',
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        }
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
        borderDash: [5, 5]
      }
    },
    x: {
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
          family: 'Inter, sans-serif'
        }
      },
      grid: {
        display: false
      }
    }
  }
};

// Weekly Daily Breakdown Chart
export const WeeklyDailyBreakdownChart = ({ data, title = "Daily Performance Throughout the Week" }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available for visualization</p>
      </div>
    );
  }

  // Sort by day order
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedData = Object.entries(data).sort(([,a], [,b]) => {
    return dayOrder.indexOf(a.dayName) - dayOrder.indexOf(b.dayName);
  });

  const chartData = {
    labels: sortedData.map(([, dayData]) => dayData.dayName),
    datasets: [
      {
        label: 'Average Rating',
        data: sortedData.map(([, dayData]) => dayData.averageRating),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Participation Rate (%)',
        data: sortedData.map(([, dayData]) => dayData.participationRate / 20), // Scale to fit 0-5 range
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#1F2937',
        padding: 20
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Average Rating: ${context.parsed.y}/5`;
            } else {
              return `Participation: ${(context.parsed.y * 20).toFixed(1)}%`;
            }
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Weekly Meal Trends Chart
export const WeeklyMealTrendsChart = ({ data, title = "Meal Performance Trends" }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No meal trend data available</p>
      </div>
    );
  }

  const mealNames = {
    morning: 'Breakfast',
    afternoon: 'Lunch',
    evening: 'Dinner',
    night: 'Night Snacks'
  };

  const chartData = {
    labels: Object.keys(data).map(meal => mealNames[meal] || meal),
    datasets: [
      {
        label: 'Weekly Average Rating',
        data: Object.values(data).map(mealData => mealData.weeklyAverage || 0),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',   // Yellow for Breakfast
          'rgba(249, 115, 22, 0.8)',   // Orange for Lunch
          'rgba(59, 130, 246, 0.8)',   // Blue for Dinner
          'rgba(34, 197, 94, 0.8)'     // Green for Night Snacks
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Weekly Participation Trends Chart
export const WeeklyParticipationChart = ({ data, title = "Weekly Participation Trends" }) => {
  if (!data || !data.dailyParticipation || data.dailyParticipation.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No participation data available</p>
      </div>
    );
  }

  // Sort by day order
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sortedData = data.dailyParticipation.sort((a, b) => {
    return dayOrder.indexOf(a.dayName) - dayOrder.indexOf(b.dayName);
  });

  const chartData = {
    labels: sortedData.map(day => day.dayName),
    datasets: [
      {
        label: 'Participation Rate',
        data: sortedData.map(day => day.participationRate),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4
      },
      {
        label: 'Number of Students',
        data: sortedData.map(day => day.participatingStudents),
        fill: false,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#1F2937',
        padding: 20
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Participation Rate: ${context.parsed.y}%`;
            } else {
              return `Students: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          },
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          borderDash: [5, 5]
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          drawOnChartArea: false,
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

// Weekly Performance Radar Chart
export const WeeklyPerformanceRadarChart = ({ data, title = "Weekly Performance Overview" }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No performance data available</p>
      </div>
    );
  }

  const mealNames = {
    morning: 'Breakfast',
    afternoon: 'Lunch',
    evening: 'Dinner',
    night: 'Night Snacks'
  };

  const chartData = {
    labels: Object.keys(data).map(meal => mealNames[meal] || meal),
    datasets: [
      {
        label: 'Average Rating',
        data: Object.values(data).map(mealData => mealData.weeklyAverage || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Consistency Score',
        data: Object.values(data).map(mealData => (mealData.consistency || 0) / 20), // Scale to 0-5
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#1F2937',
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Average Rating: ${context.parsed.r}/5`;
            } else {
              return `Consistency: ${(context.parsed.r * 20).toFixed(1)}%`;
            }
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#6B7280',
          font: {
            size: 10,
            family: 'Inter, sans-serif'
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        },
        angleLines: {
          color: 'rgba(107, 114, 128, 0.2)'
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Radar data={chartData} options={options} />
    </div>
  );
};

// Weekly Patterns Pie Chart
export const WeeklyPatternsPieChart = ({ data, title = "Weekend vs Weekday Performance" }) => {
  if (!data || !data.weekendVsWeekday) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No pattern data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Weekday Average', 'Weekend Average'],
    datasets: [
      {
        data: [
          data.weekendVsWeekday.weekdayAverage || 0,
          data.weekendVsWeekday.weekendAverage || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue for weekdays
          'rgba(234, 179, 8, 0.8)'     // Yellow for weekends
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#1F2937',
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}/5`;
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
