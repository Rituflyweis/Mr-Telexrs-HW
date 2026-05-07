const mongoose = require('mongoose');

const healthWarehouseEventSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    hw_order_id: {
      type: Number,
      required: true,
      index: true
    },
    event_type: {
      type: String,
      enum: ['order', 'shipment'],
      required: true
    },
    source: {
      type: String,
      enum: ['webhook', 'poll', 'simulation'],
      required: true
    },
    hw_status: String,
    local_status: String,
    message: String,
    shipment_id: String,
    tracking_number: String,
    carrier_code: String,
    carrier_title: String,
    items_shipped: Number,
    raw_payload: mongoose.Schema.Types.Mixed,
    idempotency_key: {
      type: String,
      required: true,
      unique: true
    },
    received_at: {
      type: Date,
      default: Date.now
    },
    processed_at: Date
  },
  { timestamps: true }
);

healthWarehouseEventSchema.index({ hw_order_id: 1, createdAt: -1 });
healthWarehouseEventSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('HealthWarehouseEvent', healthWarehouseEventSchema);
