const initializeDatabase = require("../config/db");
const logger = require("../utils/logger"); // Add a logger utility

async function createReceipt(patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance) {
    const db = await initializeDatabase();
    try {
        const sql = "INSERT INTO receipts (patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance]);
        return result;
    } catch (error) {
        logger.error(`Error in createReceipt: ${error.message}`, error);
        return null;
    } finally {
        await db.end();
    }
}

async function getReceiptDetails(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query(
            `SELECT * FROM receipts WHERE id = ?`,
            [id]
        );
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        logger.error(`Error in getReceiptDetails: ${error.message}`, error);
        throw new Error("Failed to retrieve receipt details");
    } finally {
        await db.end();
    }
}

async function getReceipts() {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("SELECT * FROM receipts ORDER BY id");
        return result;
    } catch (error) {
        logger.error(`Error in getReceipts: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function deleteReceipt(id) {
    const db = await initializeDatabase();
    try {
        const [result] = await db.query("DELETE FROM receipts WHERE id = ?", [id]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in deleteReceipt: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

async function updateReceipt(id, patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance) {
    const db = await initializeDatabase();
    try {
        const sql = `
            UPDATE receipts
            SET patient_name = ?, patient_phone = ?, service = ?, qty = ?, discount = ?, amount = ?, total = ?, mode_of_payment = ?, amount_paid = ?, balance = ?
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [
            patient_name,
            patient_phone,
            service,
            qty,
            discount,
            amount,
            total,
            mode_of_payment,
            amount_paid,
            balance,
            id
        ]);
        return result.affectedRows > 0;
    } catch (error) {
        logger.error(`Error in updateReceipt: ${error.message}`, error);
        throw error;
    } finally {
        await db.end();
    }
}

module.exports = { createReceipt, getReceiptDetails, getReceipts, deleteReceipt, updateReceipt };
