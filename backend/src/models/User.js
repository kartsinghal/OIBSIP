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
      sparse: true,       // allows multiple null values (unique only when set)
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      default: null,
    },
    phone: {
      type: String,
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

// Compound index: unique phone per provider when set
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);
export default User;
