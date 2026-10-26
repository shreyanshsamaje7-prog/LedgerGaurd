const depositRequestModel = require("../models/depositRequest.model");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - POST /api/deposit-requests
 * - Normal user requests initial welcome deposit (One-time only)
 */
async function createDepositRequestController(req, res) {
    const { accountId, amount = 5000 } = req.body;

    if (req.user.systemUser) {
        return res.status(400).json({
            message: "System operators manage central liquidity and do not request consumer deposits."
        });
    }

    // Check if user already submitted a request
    const existing = await depositRequestModel.findOne({ user: req.user._id });
    if (existing) {
        return res.status(400).json({
            message: "You have already submitted your one-time first deposit request.",
            request: existing
        });
    }

    if (!accountId) {
        return res.status(400).json({
            message: "Please specify an account to receive your deposit."
        });
    }

    // Verify account belongs to user
    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });

    if (!account) {
        return res.status(400).json({
            message: "Invalid account selected."
        });
    }

    const request = await depositRequestModel.create({
        user: req.user._id,
        account: accountId,
        amount: Number(amount) || 5000,
        status: "PENDING"
    });

    res.status(201).json({
        message: "First deposit request submitted to System Operator for approval.",
        request
    });
}

/**
 * - GET /api/deposit-requests/my-request
 * - Check if user has an existing deposit request
 */
async function getMyDepositRequestController(req, res) {
    const request = await depositRequestModel.findOne({ user: req.user._id })
        .populate("account")
        .populate("transaction");

    res.status(200).json({
        canRequest: !request,
        request: request || null
    });
}

/**
 * - GET /api/deposit-requests
 * - System operator views all incoming deposit requests
 */
async function getAllDepositRequestsController(req, res) {
    const requests = await depositRequestModel.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .populate("account")
        .populate("transaction");

    res.status(200).json({
        requests
    });
}

/**
 * - POST /api/deposit-requests/:requestId/approve
 * - System operator approves request and disburses funds atomically
 */
async function approveDepositRequestController(req, res) {
    const { requestId } = req.params;

    const request = await depositRequestModel.findById(requestId)
        .populate("user", "name email")
        .populate("account");

    if (!request) {
        return res.status(404).json({
            message: "Deposit request not found."
        });
    }

    if (request.status !== "PENDING") {
        return res.status(400).json({
            message: `Deposit request is already ${request.status}.`
        });
    }

    // Ensure or auto-create Treasury Reserve account for the system operator
    let treasuryAccount = await accountModel.findOne({ user: req.user._id });
    if (!treasuryAccount) {
        treasuryAccount = await accountModel.create({
            user: req.user._id,
            currency: "INR",
            status: "ACTIVE"
        });
    }

    const idempotencyKey = `dep_req_${request._id}_${Date.now()}`;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transaction = new transactionModel({
            fromAccount: treasuryAccount._id,
            toAccount: request.account._id,
            amount: request.amount,
            idempotencyKey,
            status: "COMPLETED"
        });
        await transaction.save({ session });

        // Double-entry: Debit Treasury, Credit User
        await ledgerModel.create([
            {
                account: treasuryAccount._id,
                amount: request.amount,
                transaction: transaction._id,
                type: "DEBIT"
            }
        ], { session });

        await ledgerModel.create([
            {
                account: request.account._id,
                amount: request.amount,
                transaction: transaction._id,
                type: "CREDIT"
            }
        ], { session });

        request.status = "APPROVED";
        request.transaction = transaction._id;
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        await request.save({ session });

        await session.commitTransaction();

        // Send transaction email asynchronously
        if (request.user?.email) {
            emailService.sendTransactionEmail(
                request.user.email,
                request.user.name,
                request.amount,
                request.account._id
            ).catch(err => console.error("Email send error:", err.message));
        }

        return res.status(200).json({
            message: "Deposit request approved and funds successfully disbursed!",
            request,
            transaction
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        return res.status(500).json({
            message: "Failed to process funds disbursement: " + err.message
        });
    } finally {
        await session.endSession();
    }
}

/**
 * - POST /api/deposit-requests/:requestId/reject
 * - System operator rejects request
 */
async function rejectDepositRequestController(req, res) {
    const { requestId } = req.params;

    const request = await depositRequestModel.findById(requestId);
    if (!request) {
        return res.status(404).json({
            message: "Deposit request not found."
        });
    }

    if (request.status !== "PENDING") {
        return res.status(400).json({
            message: `Deposit request is already ${request.status}.`
        });
    }

    request.status = "REJECTED";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    res.status(200).json({
        message: "Deposit request rejected.",
        request
    });
}

module.exports = {
    createDepositRequestController,
    getMyDepositRequestController,
    getAllDepositRequestsController,
    approveDepositRequestController,
    rejectDepositRequestController
};
