import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  preferredLanguage: {
    type: DataTypes.ENUM('en', 'fr'),
    defaultValue: 'en',
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark'),
    defaultValue: 'light',
  },
});

// Hash password if present
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add composite unique indexes to prevent duplicates
User.associate = function(models) {
  // This ensures username is unique
  User.beforeValidate(async (user) => {
    if (user.changed('username')) {
      const existingUser = await User.findOne({ where: { username: user.username } });
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Username already in use');
      }
    }
    
    // This ensures email is unique if provided
    if (user.email && user.changed('email')) {
      const existingUser = await User.findOne({ where: { email: user.email } });
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Email already in use');
      }
    }
    
    // This ensures googleId is unique if provided
    if (user.googleId && user.changed('googleId')) {
      const existingUser = await User.findOne({ where: { googleId: user.googleId } });
      if (existingUser && existingUser.id !== user.id) {
        throw new Error('Google account already in use');
      }
    }
  });
};

export default User;
