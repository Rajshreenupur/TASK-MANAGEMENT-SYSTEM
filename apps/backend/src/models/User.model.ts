import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface RefreshToken {
  token: string;
  expiresAt: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  refreshTokens: RefreshToken[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addRefreshToken(token: string, expiresAt: Date): void;
  removeRefreshToken(token: string): void;
  hasValidRefreshToken(token: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'MEMBER'],
      default: 'MEMBER',
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addRefreshToken = function (token: string, expiresAt: Date): void {
  this.refreshTokens.push({ token, expiresAt });
  // Keep only last 5 refresh tokens per user
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

userSchema.methods.removeRefreshToken = function (token: string): void {
  this.refreshTokens = this.refreshTokens.filter((rt: RefreshToken) => rt.token !== token);
};

userSchema.methods.hasValidRefreshToken = function (token: string): boolean {
  const refreshToken = this.refreshTokens.find((rt: RefreshToken) => rt.token === token);
  if (!refreshToken) return false;
  return refreshToken.expiresAt > new Date();
};

export const User = mongoose.model<IUser>('User', userSchema);

