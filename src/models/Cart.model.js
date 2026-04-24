const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: String,
  productType: {
    type: String,
    enum: ['medication', 'doctors_note', 'other'],
    default: 'medication'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isSaved: {
    type: Boolean,
    default: false
  }
});

const cartSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    couponCode: String,
    discount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    consultantFees: {
      type: Number,
      default: 0
    },
    shippingCharges: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Calculate totals before save
cartSchema.pre('save', function (next) {
  // Calculate subtotal from items (exclude saved items)
  const activeItems = this.items.filter(item => !item.isSaved);
  
  // Separate doctors_note items from regular items
  const doctorsNoteItems = activeItems.filter(item => item.productType === 'doctors_note');
  const regularItems = activeItems.filter(item => item.productType !== 'doctors_note');
  
  // Calculate subtotal for each type
  const doctorsNoteSubtotal = doctorsNoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const regularSubtotal = regularItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Total subtotal
  this.subtotal = doctorsNoteSubtotal + regularSubtotal;
  
  // Reset tax, shipping, and discount if cart is empty or all items are saved
  if (this.subtotal === 0 || activeItems.length === 0) {
    this.tax = 0;
    this.shippingCharges = 0;
    this.discount = 0;
    this.couponCode = undefined;
  } else {
    // Only apply tax and shipping to regular items, NOT to doctors_note items
    if (regularItems.length === 0) {
      // Cart contains only doctors_note items - no tax and shipping
      this.tax = 0;
      this.shippingCharges = 0;
    } else {
      // Calculate tax (3% of subtotal for regular items only)
      this.tax = regularSubtotal * 0.03;
      
      // Set shipping charges (default ₹10 if not set) - only for regular items
      if (!this.shippingCharges || this.shippingCharges === 0) {
        this.shippingCharges = 10.00;
      }
    }
  }
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.shippingCharges + this.tax - this.discount;
  
  next();
});

module.exports = mongoose.model('Cart', cartSchema);

