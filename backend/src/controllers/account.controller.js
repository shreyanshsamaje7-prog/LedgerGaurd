const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");


async function createAccountController(req, res) {

    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })

}

async function getUserAccountsController(req, res) {

    const accounts = await accountModel.find({ user: req.user._id });

    // Populate balances for ease of frontend consumption
    const accountsWithBalance = await Promise.all(
        accounts.map(async (acc) => {
            const balance = await acc.getBalance();
            return {
                ...acc.toObject(),
                balance
            };
        })
    );

    res.status(200).json({
        accounts: accountsWithBalance
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

async function getAccountLedgerController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const ledgerEntries = await ledgerModel.find({ account: accountId })
        .populate("transaction")
        .sort({ _id: -1 });

    res.status(200).json({
        accountId: account._id,
        ledgerEntries
    })
}


module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    getAccountLedgerController
}