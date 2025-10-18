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
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';

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
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
};

// Enhanced Rating Distribution Pie Chart with animations
export const RatingDistributionChart = ({ data, title = "Rating Distribution" }) => {
  const chartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        data: data || [30, 25, 20, 15, 10],
        backgroundColor: [
          '#10B981', // Green for 5 stars
          '#34D399', // Light green for 4 stars
          '#FCD34D', // Yellow for 3 stars
          '#F97316', // Orange for 2 stars
          '#EF4444', // Red for 1 star
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 10,
        hoverBorderWidth: 4,
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
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

// Enhanced Meal Performance Bar Chart with gradient and animations
export const MealPerformanceChart = ({ data, title = "Meal Performance" }) => {
  const chartData = {
    labels: data?.labels || ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    datasets: [
      {
        label: 'Average Rating',
        data: data?.ratings || [4.2, 3.8, 4.1, 3.9],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',  // Yellow for breakfast
          'rgba(249, 115, 22, 0.8)',  // Orange for lunch
          'rgba(59, 130, 246, 0.8)',  // Blue for dinner
          'rgba(34, 197, 94, 0.8)',   // Green for snacks
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Enhanced Weekly Trend Line Chart with multiple metrics
export const WeeklyTrendChart = ({ data, title = "Weekly Rating Trends" }) => {
  const chartData = {
    labels: data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Overall Rating',
        data: data?.overall || [4.1, 3.9, 4.2, 4.0, 3.8, 4.3, 4.1],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Participation Rate (%)',
        data: data?.participation || [85, 82, 88, 86, 80, 90, 87],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    ...commonOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Rating (1-5)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Participation (%)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// Enhanced Participation Rate Doughnut Chart with center text
export const ParticipationChart = ({ data, title = "Participation Overview" }) => {
  const chartData = {
    labels: ['Participated', 'Did Not Participate'],
    datasets: [
      {
        data: data || [75, 25],
        backgroundColor: [
          '#10B981',
          '#E5E7EB',
        ],
        borderColor: '#fff',
        borderWidth: 4,
        cutout: '70%',
        hoverOffset: 10,
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
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  const centerText = data ? data[0] : 75;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative">
      <div className="h-80 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{centerText}%</div>
            <div className="text-sm text-gray-600">Participation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Historical Comparison Chart
export const HistoricalComparisonChart = ({ data, title = "Historical Comparison" }) => {
  const chartData = {
    labels: data?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Breakfast',
        data: data?.breakfast || [4.1, 4.2, 4.0, 4.3],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Lunch',
        data: data?.lunch || [3.8, 3.9, 3.7, 4.0],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Dinner',
        data: data?.dinner || [4.1, 4.0, 4.2, 4.1],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Snacks',
        data: data?.snacks || [3.9, 4.0, 3.8, 4.1],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// Enhanced Sentiment Analysis Chart
export const SentimentAnalysisChart = ({ data, title = "Feedback Sentiment" }) => {
  const chartData = {
    labels: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
    datasets: [
      {
        data: data || [35, 30, 20, 10, 5],
        backgroundColor: [
          '#10B981',
          '#34D399',
          '#FCD34D',
          '#F97316',
          '#EF4444',
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 8,
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
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

// NEW: Advanced Meal Quality Radar Chart
export const MealQualityRadarChart = ({ data, title = "Meal Quality Analysis" }) => {
  const chartData = {
    labels: ['Taste', 'Hygiene', 'Quantity', 'Variety', 'Temperature', 'Service'],
    datasets: [
      {
        label: 'Current Performance',
        data: data?.current || [4.2, 4.5, 3.8, 4.0, 4.1, 4.3],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Target Performance',
        data: data?.target || [4.5, 4.7, 4.2, 4.3, 4.4, 4.5],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#6B7280',
          backdropColor: 'transparent',
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

// NEW: Real-time Feedback Heatmap (Using Polar Area as approximation)
export const FeedbackHeatmapChart = ({ data, title = "Feedback Intensity by Time" }) => {
  const chartData = {
    labels: ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM', '6-9 PM', '9-12 AM'],
    datasets: [
      {
        data: data || [45, 65, 80, 55, 85, 25],
        backgroundColor: [
          'rgba(251, 191, 36, 0.7)',  // Morning
          'rgba(34, 197, 94, 0.7)',   // Mid-morning
          'rgba(249, 115, 22, 0.7)',  // Afternoon
          'rgba(59, 130, 246, 0.7)',  // Evening
          'rgba(139, 69, 19, 0.7)',   // Night
          'rgba(107, 114, 128, 0.7)', // Late night
        ],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#6B7280',
          backdropColor: 'transparent',
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <PolarArea data={chartData} options={options} />
      </div>
    </div>
  );
};

// NEW: Monthly Performance Comparison Chart
export const MonthlyComparisonChart = ({ data, title = "Monthly Performance Overview" }) => {
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Rating',
        type: 'line',
        data: data?.ratings || [4.1, 4.2, 3.9, 4.3, 4.0, 4.2],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Total Feedback Count',
        type: 'bar',
        data: data?.feedback || [150, 165, 140, 180, 155, 170],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    ...commonOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Average Rating',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Feedback Count',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// NEW: Student Satisfaction Gauge Chart (Using Doughnut approximation)
export const SatisfactionGaugeChart = ({ data, title = "Student Satisfaction Score" }) => {
  const satisfactionScore = data?.score || 78;
  const chartData = {
    labels: ['Satisfied', 'Remaining'],
    datasets: [
      {
        data: [satisfactionScore, 100 - satisfactionScore],
        backgroundColor: [
          satisfactionScore >= 80 ? '#10B981' : 
          satisfactionScore >= 60 ? '#FCD34D' : '#EF4444',
          '#E5E7EB',
        ],
        borderColor: '#fff',
        borderWidth: 4,
        cutout: '75%',
        circumference: 180,
        rotation: 270,
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
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative">
      <div className="h-80 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center mt-8">
            <div className={`text-4xl font-bold ${
              satisfactionScore >= 80 ? 'text-green-600' : 
              satisfactionScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {satisfactionScore}%
            </div>
            <div className="text-sm text-gray-600">Satisfaction</div>
            <div className={`text-xs font-medium mt-1 ${
              satisfactionScore >= 80 ? 'text-green-600' : 
               satisfactionScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {satisfactionScore >= 80 ? 'Excellent' : 
               satisfactionScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Complaint Categories Chart
export const ComplaintCategoriesChart = ({ data, title = "Common Complaint Categories" }) => {
  const chartData = {
    labels: data?.labels || ['Food Quality', 'Service Speed', 'Hygiene', 'Variety', 'Temperature', 'Portion Size'],
    datasets: [
      {
        data: data?.values || [35, 20, 15, 12, 10, 8],
        backgroundColor: [
          '#EF4444',
          '#F97316',
          '#FCD34D',
          '#34D399',
          '#3B82F6',
          '#8B5CF6',
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 8,
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
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

// NEW: Peak Hours Analysis Chart
export const PeakHoursChart = ({ data, title = "Feedback Activity by Hour" }) => {
  const chartData = {
    labels: data?.labels || ['6AM', '7AM', '8AM', '12PM', '1PM', '2PM', '7PM', '8PM', '9PM'],
    datasets: [
      {
        label: 'Feedback Count',
        data: data?.values || [15, 45, 35, 60, 85, 40, 70, 55, 25],
        backgroundColor: (context) => {
          const canvas = context.chart.canvas;
          const ctx = canvas.getContext('2d');
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
          return gradient;
        },
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Number of Feedbacks',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 20
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
