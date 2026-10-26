const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "FromAccount, toAccount, amount and idempotencyKey are required"
        });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "Transfer amount must be a positive number greater than 0"
        });
    }

    if (String(fromAccount) === String(toAccount)) {
        return res.status(400).json({
            message: "Source and destination accounts must be different"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        });
    }

    // Security Check: Verify sender owns the source account (unless system operator)
    if (!req.user.systemUser && String(fromUserAccount.user) !== String(req.user._id)) {
        return res.status(403).json({
            message: "Unauthorized: You do not own the source account"
        });
    }

    /**
     * 2. Validate idempotency key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry with a new idempotency key"
            });
        }

        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            });
        }
    }

    /**
     * 3. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        });
    }

    /**
     * 4. Preliminary balance check (fast fail before acquiring DB transaction locks)
     */
    const preCheckBalance = await fromUserAccount.getBalance();
    if (preCheckBalance < numericAmount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${preCheckBalance}. Requested amount is ${numericAmount}`
        });
    }

    let transaction;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        /**
         * 5. Concurrency Control: Acquire exclusive document write lock on sender account
         * Eliminates TOCTOU double-spending vulnerabilities across concurrent requests
         */
        const lockedFromAccount = await accountModel.findOneAndUpdate(
            { _id: fromAccount, status: "ACTIVE" },
            { $inc: { version: 1 } },
            { session, new: true }
        );

        if (!lockedFromAccount) {
            const err = new Error("Source account is unavailable or inactive");
            err.statusCode = 400;
            throw err;
        }

        /**
         * 6. Derive sender balance INSIDE the session snapshot (Atomic double-spend check)
         */
        const sessionBalance = await lockedFromAccount.getBalance(session);
        if (sessionBalance < numericAmount) {
            const err = new Error(`Insufficient balance. Current balance is ${sessionBalance}. Requested amount is ${numericAmount}`);
            err.statusCode = 400;
            throw err;
        }

        /**
         * 7. Create transaction (PENDING)
         */
        transaction = (await transactionModel.create([ {
            fromAccount,
            toAccount,
            amount: numericAmount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ];

        /**
         * 8. Create DEBIT ledger entry
         */
        await ledgerModel.create([ {
            account: fromAccount,
            amount: numericAmount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session });

        // 15-second ACID demonstration delay
        await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

        /**
         * 9. Create CREDIT ledger entry
         */
        await ledgerModel.create([ {
            account: toAccount,
            amount: numericAmount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session });

        /**
         * 10. Mark transaction COMPLETED and commit distributed session
         */
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        // Concurrency WriteConflict (MongoDB error code 112 or TransientTransactionError)
        if (error.code === 112 || error.hasErrorLabel?.('TransientTransactionError')) {
            return res.status(409).json({
                message: "A concurrent transaction is currently in progress on this account. Please retry in a few moments."
            });
        }

        // Duplicate idempotency key race condition
        if (error.code === 11000 && (error.keyPattern?.idempotencyKey || error.message?.includes('idempotencyKey'))) {
            const existingTx = await transactionModel.findOne({ idempotencyKey });
            if (existingTx) {
                return res.status(200).json({
                    message: existingTx.status === "COMPLETED" ? "Transaction already processed" : "Transaction is still processing",
                    transaction: existingTx
                });
            }
        }

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message || "Transaction could not be completed, please retry"
        });
    } finally {
        await session.endSession();
    }

    /**
     * 11. Send email notification asynchronously
     */
    if (req.user?.email) {
        emailService.sendTransactionEmail(req.user.email, req.user.name, numericAmount, toAccount)
            .catch(err => console.warn("Email dispatch error:", err.message));
    }

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    });

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            message: "Amount must be a positive number greater than 0"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        });
    }

    const existingTx = await transactionModel.findOne({ idempotencyKey });
    if (existingTx) {
        return res.status(200).json({
            message: "Initial funds transaction already processed",
            transaction: existingTx
        });
    }

    let transaction;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        transaction = (await transactionModel.create([ {
            fromAccount: fromUserAccount._id,
            toAccount,
            amount: numericAmount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ];

        await ledgerModel.create([ {
            account: fromUserAccount._id,
            amount: numericAmount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session });

        await ledgerModel.create([ {
            account: toAccount,
            amount: numericAmount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session });

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        if (error.code === 11000 && (error.keyPattern?.idempotencyKey || error.message?.includes('idempotencyKey'))) {
            const alreadyProcessed = await transactionModel.findOne({ idempotencyKey });
            if (alreadyProcessed) {
                return res.status(200).json({
                    message: "Initial funds transaction already processed",
                    transaction: alreadyProcessed
                });
            }
        }

        return res.status(500).json({
            message: "Initial funds transfer failed: " + (error.message || "Unknown error")
        });
    } finally {
        await session.endSession();
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    });

}

async function getUserTransactionsController(req, res) {
    const userAccounts = await accountModel.find({ user: req.user._id }).select("_id");
    const accountIds = userAccounts.map(a => a._id);

    const transactions = await transactionModel.find({
        $or: [
            { fromAccount: { $in: accountIds } },
            { toAccount: { $in: accountIds } }
        ]
    })
    .sort({ createdAt: -1 })
    .populate({
        path: "fromAccount",
        populate: { path: "user", select: "name email" }
    })
    .populate({
        path: "toAccount",
        populate: { path: "user", select: "name email" }
    });

    res.status(200).json({
        transactions
    });
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction,
    getUserTransactionsController
}

