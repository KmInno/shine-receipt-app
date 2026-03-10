const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expensesController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All expense routes require authentication
router.use(authMiddleware);

// GET - Add expense page (display form)
router.get("/add", expensesController.getExpensesPage);

// GET - Render expenses page
router.get("/", expensesController.getExpensesPage);

// GET - Expenses by date
router.get("/by-date", expensesController.getExpensesByDate);

// GET - Expenses by date range (API)
router.get("/range", expensesController.getExpensesRange);

// POST - Add new expense (all authenticated users)
router.post("/add", expensesController.addExpense);

// PUT - Update expense (requires admin)
router.put("/:id", adminMiddleware, expensesController.updateExpense);

// DELETE - Delete expense (requires admin)
router.delete("/:id", adminMiddleware, expensesController.deleteExpense);

module.exports = router;
