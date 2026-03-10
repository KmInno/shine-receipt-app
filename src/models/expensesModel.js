const initializeDatabase = require("../config/db");
const logger = require("../utils/logger");

// Create a new expense
async function createExpense(category, amount, created_by) {
    const db = await initializeDatabase();
    try {
        const sql = "INSERT INTO expenses (category, amount, created_by) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [category, amount, created_by]);
        return result;
    } catch (error) {
        logger.error(`Error in createExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get all expenses
async function getAllExpenses() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM expenses ORDER BY expense_date DESC");
        return result;
    } catch (error) {
        logger.error(`Error in getAllExpenses: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses for a specific date
async function getExpensesByDate(date) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM expenses WHERE DATE(created_at) = ? ORDER BY created_at DESC", [date]);
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses for a date range
async function getExpensesByDateRange(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            "SELECT * FROM expenses WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC",
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByDateRange: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get total expenses for a date
async function getTotalExpensesByDate(date) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT SUM(CAST(amount AS DECIMAL(10,2))) as total FROM expenses WHERE DATE(created_at) = ?", [date]);
        return parseFloat(result[0].total) || 0;
    } catch (error) {
        logger.error(`Error in getTotalExpensesByDate: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get expenses by category
async function getExpensesByCategory(category, startDate, endDate) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            "SELECT * FROM expenses WHERE category = ? AND DATE(expense_date) BETWEEN ? AND ? ORDER BY expense_date DESC",
            [category, startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getExpensesByCategory: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Get total expenses by category for a date range
async function getTotalExpensesByCategory(startDate, endDate) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            "SELECT category, SUM(amount) as total FROM expenses WHERE DATE(expense_date) BETWEEN ? AND ? GROUP BY category ORDER BY total DESC",
            [startDate, endDate]
        );
        return result;
    } catch (error) {
        logger.error(`Error in getTotalExpensesByCategory: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Update an expense
async function updateExpense(id, expense_date, description, category, amount) {
    const db = await initializeDatabase();
    try {
        const sql = "UPDATE expenses SET expense_date = ?, description = ?, category = ?, amount = ? WHERE id = ?";
        const [result] = await db.query(sql, [expense_date, description, category, amount, id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

// Delete an expense
async function deleteExpense(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("DELETE FROM expenses WHERE id = ?", [id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deleteExpense: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = {
    createExpense,
    getAllExpenses,
    getExpensesByDate,
    getExpensesByDateRange,
    getTotalExpensesByDate,
    getExpensesByCategory,
    getTotalExpensesByCategory,
    updateExpense,
    deleteExpense
};
