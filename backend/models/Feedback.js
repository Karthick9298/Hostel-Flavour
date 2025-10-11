import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: () => {
      // Set to current date in IST, but only date part (no time)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istDate = new Date(now.getTime() + istOffset);
      return new Date(istDate.getFullYear(), istDate.getMonth(), istDate.getDate());
    }
  },
  meals: {
    morning: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    afternoon: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    evening: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    night: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one feedback per user per day
feedbackSchema.index({ user: 1, date: 1 }, { unique: true });

// Index for faster date-based queries
feedbackSchema.index({ date: -1 });

// Method to check if a meal can be submitted based on time
feedbackSchema.methods.canSubmitMeal = function(mealType) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  const currentHour = istTime.getHours();

  // Check if meal is already submitted
  if (this.meals[mealType].rating !== null) {
    return { canSubmit: false, reason: 'Meal already submitted' };
  }

  // Time-based submission rules
  switch (mealType) {
    case 'morning':
      if (currentHour >= 9) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: 'Morning meal feedback can only be submitted after 9 AM' };
    
    case 'afternoon':
      if (currentHour >= 12) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: 'Afternoon meal feedback can only be submitted after 12 PM' };
    
    case 'evening':
      if (currentHour >= 17) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: 'Evening meal feedback can only be submitted after 5 PM' };
    
    case 'night':
      if (currentHour >= 20) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: 'Night meal feedback can only be submitted after 8 PM' };
    
    default:
      return { canSubmit: false, reason: 'Invalid meal type' };
  }
};

// Method to get submission statistics
feedbackSchema.methods.getSubmissionStats = function() {
  const submittedMeals = ['morning', 'afternoon', 'evening', 'night'].filter(
    meal => this.meals[meal].rating !== null
  );
  
  return {
    totalMeals: 4,
    submittedMeals: submittedMeals.length,
    pendingMeals: 4 - submittedMeals.length,
    submittedMealTypes: submittedMeals
  };
};

export default mongoose.model('Feedback', feedbackSchema);
