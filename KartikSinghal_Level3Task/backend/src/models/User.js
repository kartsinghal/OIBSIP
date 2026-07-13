import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,       // allows multiple null values (unique only when set)
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      default: null,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    // 'local' = email/password, 'google' = Google OAuth, 'phone' = OTP
    authProvider: {
      type: String,
      enum: ['local', 'google', 'phone'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'kitchen'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes removed in favor of field-level unique constraints

const User = mongoose.model('User', userSchema);
export default User;
