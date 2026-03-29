import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  result: { type: String, enum: ['success', 'blocked'], required: true },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'error', 'success'], required: true },
  }],
  timestamp: { type: Date, default: Date.now },
});

export const Simulation = mongoose.model('Simulation', simulationSchema);
