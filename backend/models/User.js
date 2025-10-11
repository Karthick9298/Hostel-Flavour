import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  hostelRoom: {
    type: String,
    required: [true, 'Hostel room is required'],
    trim: true,
    match: [/^[AB]-\d+$/, 'Room format should be like A-101 or B-205']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required'],
    unique: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes are automatically created for unique fields
// Additional indexes can be added here if needed for non-unique fields

// Virtual for user's full display name
userSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.rollNumber})`;
});

// Method to check if user is admin
userSchema.methods.isAdminUser = function() {
  return this.isAdmin;
};

export default mongoose.model('User', userSchema);
