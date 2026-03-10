const baseController = require("../controllers/baseController");
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, baseController.buildHome);
router.get("/receipt", authenticateToken, baseController.buildReceipt);
router.get("/blank", authenticateToken, baseController.buildBlank);

module.exports = router;