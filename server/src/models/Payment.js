import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["CASH", "STRIPE", "MOCK"],
      default: "MOCK",
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
    },

    paidAt: Date,
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

paymentSchema.index(
  { stripePaymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripePaymentIntentId: {
        $type: "string",
        $gt: "",
      },
    },
  }
);

export default mongoose.model("Payment", paymentSchema);
