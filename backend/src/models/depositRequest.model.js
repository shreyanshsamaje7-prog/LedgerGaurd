const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Deposit request must be associated with a user"],
        index: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Deposit request must specify a recipient account"],
        index: true
    },
    amount: {
        type: Number,
        default: 5000,
        required: true,
        min: [1, "Amount must be at least 1"]
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
        index: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction"
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Strictly enforce one request per user
depositRequestSchema.index({ user: 1 }, { unique: true });

const depositRequestModel = mongoose.model("depositRequest", depositRequestSchema);

module.exports = depositRequestModel;
