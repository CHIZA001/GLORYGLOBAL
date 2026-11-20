const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },

  paymentMethod: {
    type: String,
    enum: ["Cash", "Transfer", "POS"],
    required: true
  },

  receivedBy: {
    type: String,
    required: true
  },

  reference: {
    type: String,
    default: ""
  },

  paidAt: {
    type: Date,
    default: Date.now
  }
});

const saleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true
    },

    customerName: {
      type: String,
      default: "Walk-in Customer"
    },

    customerPhone: {
      type: String,
      default: ""
    },

    salesperson: {
      type: String,
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        productCode: String,
        productName: String,

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        unitPrice: {
          type: Number,
          required: true,
          min: 0
        },

        unitCost: {
          type: Number,
          required: true,
          min: 0
        },

        total: Number,
        profit: Number
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    totalCost: {
      type: Number,
      required: true,
      min: 0
    },

    grossProfit: {
      type: Number,
      required: true
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },

    balanceDue: {
      type: Number,
      default: 0,
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID"],
      default: "UNPAID"
    },

    payments: [paymentSchema],

    dueDate: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Sale", saleSchema);