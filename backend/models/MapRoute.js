const mongoose = require('mongoose');

const activeRouteSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
 
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'canceled'],  
    default: 'in-progress',
  },
});

const ActiveRouteModel = mongoose.model('ActiveRoute', activeRouteSchema);

module.exports = ActiveRouteModel;
