const ExpensesModel = require("../models/expensesModel");
const logger = require("../utils/logger");

// Render expenses page
async function getExpensesPage(req, res, next) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const expenses = await ExpensesModel.getExpensesByDate(today);
        const totalExpenses = await ExpensesModel.getTotalExpensesByDate(today);

        res.render("expenses", {
            title: "Expenses",
            expenses: expenses,
            totalExpenses: totalExpenses || 0,
            selectedDate: today,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getExpensesPage: ${error.message}`, error);
        next(error);
    }
}

// Add new expense
async function addExpense(req, res, next) {
    try {
        const { description, category, amount } = req.body;
        
        // Validate input
        if (!description || !category || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        await ExpensesModel.createExpense(description, category, parseFloat(amount), req.user.id);

        res.status(201).json({ message: "Expense added successfully" });
    } catch (error) {
        logger.error(`Error in addExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error adding expense" });
    }
}

// Get expenses by date
async function getExpensesByDate(req, res, next) {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const expenses = await ExpensesModel.getExpensesByDate(date);
        const totalExpenses = await ExpensesModel.getTotalExpensesByDate(date);

        res.render("expenses", {
            title: "Expenses",
            expenses: expenses,
            totalExpenses: totalExpenses || 0,
            selectedDate: date,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getExpensesByDate: ${error.message}`, error);
        next(error);
    }
}

// Get expenses for date range
async function getExpensesRange(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const expenses = await ExpensesModel.getExpensesByDateRange(startDate, endDate);
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        res.status(200).json({
            expenses: expenses,
            totalExpenses: totalExpenses,
            startDate: startDate,
            endDate: endDate
        });
    } catch (error) {
        logger.error(`Error in getExpensesRange: ${error.message}`, error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
}

// Update expense
async function updateExpense(req, res, next) {
    try {
        const { id } = req.params;
        const { expense_date, description, category, amount } = req.body;

        if (!expense_date || !description || !category || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Amount must be a valid positive number" });
        }

        const updated = await ExpensesModel.updateExpense(id, expense_date, description, category, parseFloat(amount));

        if (updated) {
            res.status(200).json({ message: "Expense updated successfully" });
        } else {
            res.status(404).json({ message: "Expense not found" });
        }
    } catch (error) {
        logger.error(`Error in updateExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error updating expense" });
    }
}

// Delete expense
async function deleteExpense(req, res, next) {
    try {
        const { id } = req.params;
        // Check permission: admin or creator only
        const expense = await ExpensesModel.getExpenseById(id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const isCreator = req.user && Number(req.user.id) === Number(expense.created_by);

        if (!isCreator) {
            return res.status(403).json({ message: "Forbidden: you don't have permission to delete this expense" });
        }

        const deleted = await ExpensesModel.deleteExpense(id);

        if (deleted) {
            res.status(200).json({ message: "Expense deleted successfully" });
        } else {
            res.status(500).json({ message: "Failed to delete expense" });
        }
    } catch (error) {
        logger.error(`Error in deleteExpense: ${error.message}`, error);
        res.status(500).json({ message: "Error deleting expense" });
    }
}

module.exports = {
    getExpensesPage,
    addExpense,
    getExpensesByDate,
    getExpensesRange,
    updateExpense,
    deleteExpense
};
