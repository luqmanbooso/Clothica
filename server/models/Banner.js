const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    trim: true
  },
  linkText: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    enum: ['hero', 'featured', 'sidebar'],
    default: 'hero'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'men', 'women', 'kids'],
    default: 'all'
  }
}, {
  timestamps: true
});

// Check if banner should be displayed
bannerSchema.methods.shouldDisplay = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    (!this.endDate || now <= this.endDate)
  );
};

module.exports = mongoose.model('Banner', bannerSchema);
