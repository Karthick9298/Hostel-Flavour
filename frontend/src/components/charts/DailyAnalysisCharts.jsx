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
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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

// 1. Average Rating per Meal (Pie Chart)
export const AverageRatingPerMealChart = ({ data, title = "Average Rating per Meal" }) => {
  const chartData = {
    labels: Object.keys(data || {}),
    datasets: [
      {
        data: Object.values(data || {}),
        backgroundColor: [
          '#FCD34D', // Yellow for Breakfast
          '#F97316', // Orange for Lunch
          '#3B82F6', // Blue for Dinner
          '#8B5CF6', // Purple for Night Snacks
        ],
        borderColor: '#fff',
        borderWidth: 3,
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

// 2. Student Rating per Meal (Bar Chart)
export const StudentRatingPerMealChart = ({ data, title = "Student Participation per Meal" }) => {
  const chartData = {
    labels: Object.keys(data || {}),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(data || {}),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',  // Yellow for Breakfast
          'rgba(249, 115, 22, 0.8)',  // Orange for Lunch
          'rgba(59, 130, 246, 0.8)',  // Blue for Dinner
          'rgba(139, 69, 19, 0.8)',   // Brown for Night Snacks
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(139, 69, 19)',
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
          text: 'Number of Students',
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

// 3. Feedback Distribution per Meal (Multiple Bar Charts)
export const FeedbackDistributionChart = ({ data, mealName, title }) => {
  const mealData = data[mealName] || {};
  
  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Ratings',
        data: [
          mealData['1_star'] || 0,
          mealData['2_star'] || 0,
          mealData['3_star'] || 0,
          mealData['4_star'] || 0,
          mealData['5_star'] || 0,
        ],
        backgroundColor: [
          '#EF4444', // Red for 1 star
          '#F97316', // Orange for 2 stars
          '#FCD34D', // Yellow for 3 stars
          '#34D399', // Green for 4 stars
          '#10B981', // Dark green for 5 stars
        ],
        borderColor: '#fff',
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          stepSize: 1
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
        text: title || `${mealName} - Rating Distribution`,
        font: {
          size: 14,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 15
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

// 4. All Meals Feedback Distribution (Combined Chart)
export const AllMealsFeedbackDistributionChart = ({ data, title = "Rating Distribution Across All Meals" }) => {
  const meals = Object.keys(data || {});
  
  const datasets = meals.map((meal, index) => {
    const mealData = data[meal] || {};
    const colors = [
      '#FCD34D', // Yellow for Breakfast
      '#F97316', // Orange for Lunch
      '#3B82F6', // Blue for Dinner
      '#8B5CF6', // Purple for Night Snacks
    ];
    
    return {
      label: meal,
      data: [
        mealData['1_star'] || 0,
        mealData['2_star'] || 0,
        mealData['3_star'] || 0,
        mealData['4_star'] || 0,
        mealData['5_star'] || 0,
      ],
      backgroundColor: colors[index] || '#6B7280',
      borderColor: '#fff',
      borderWidth: 1,
      borderRadius: 4,
    };
  });

  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: datasets
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
          text: 'Number of Ratings',
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

// 5. Sentiment Score Gauge Chart
export const SentimentScoreChart = ({ data, mealName, title }) => {
  const mealData = data[mealName] || {};
  const sentimentScore = mealData.sentiment_score || 0;
  
  const chartData = {
    labels: ['Sentiment Score', 'Remaining'],
    datasets: [
      {
        data: [sentimentScore, 100 - sentimentScore],
        backgroundColor: [
          sentimentScore >= 80 ? '#10B981' : 
          sentimentScore >= 60 ? '#FCD34D' : '#EF4444',
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
        text: title || `${mealName} - Sentiment Score`,
        font: {
          size: 14,
          weight: 'bold'
        },
        color: '#1F2937',
        padding: 15
      },
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative">
      <div className="h-48 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center mt-4">
            <div className={`text-2xl font-bold ${
              sentimentScore >= 80 ? 'text-green-600' : 
              sentimentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {sentimentScore}%
            </div>
            <div className="text-xs text-gray-600">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};
