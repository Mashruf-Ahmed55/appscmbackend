import bcrypt from 'bcryptjs';
import { model, Schema } from 'mongoose';

const imageSchema = new Schema(
  {
    imageUrl: String,
    publicId: String,
  },
  {
    _id: false,
  }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    username: {
      type: String,
      sparse: true,
      trim: true,
    },

    image: {
      type: imageSchema,
      default: {
        imageUrl: 'https://personal-214257630.imgix.net/dummy-profile.png',
        publicId: null,
      },
    },

    role: {
      type: String,
      enum: ['user', 'member', 'admin'],
      default: 'user',
    },

    isMember: {
      type: Boolean,
      default: false,
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    membershipDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    accountType: {
      type: String,
      enum: ['email', 'google', 'github'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model('User', userSchema);
export default User;
