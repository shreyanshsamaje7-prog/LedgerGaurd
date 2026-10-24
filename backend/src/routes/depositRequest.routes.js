const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const depositRequestController = require("../controllers/depositRequest.controller");

const router = express.Router();

/**
 * Normal user endpoints
 */
router.post("/", authMiddleware.authMiddleware, depositRequestController.createDepositRequestController);
router.get("/my-request", authMiddleware.authMiddleware, depositRequestController.getMyDepositRequestController);

/**
 * System Operator endpoints (restricted to systemUser)
 */
router.get("/", authMiddleware.authSystemUserMiddleware, depositRequestController.getAllDepositRequestsController);
router.post("/:requestId/approve", authMiddleware.authSystemUserMiddleware, depositRequestController.approveDepositRequestController);
router.post("/:requestId/reject", authMiddleware.authSystemUserMiddleware, depositRequestController.rejectDepositRequestController);

module.exports = router;
