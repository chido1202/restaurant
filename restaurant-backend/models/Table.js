const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  tableID: {
    type: String,
    required: true,
    unique: true
  },
  area: {
    type: String,
    default: 'Main Hall'
  },
  capacity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'maintenance'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', TableSchema);
