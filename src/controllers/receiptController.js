const ReceiptItem = require("../models/receiptModel");
const logger = require("../utils/logger"); // Add a logger utility

async function addReceipt(req, res) {
    try {
        const { patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance } = req.body;
        const receipt = await ReceiptItem.createReceipt(patient_name, patient_phone, service, qty || 1, discount || 0, amount || total || 0, total || 0, mode_of_payment, amount_paid || 0, balance || 0);

        if (receipt) {
            const data = await ReceiptItem.getReceipts();
            res.status(201).render("receipts", {
                title: "Receipts",
                receipts: data,
                user: req.user
            });
        } else {
            logger.error("Failed to add receipt: Database operation returned null");
            if (!res.headersSent) {
                return res.status(500).json({ message: "Error adding receipt" });
            }
        }
    } catch (error) {
        logger.error(`Error in addReceipt: ${error.message}`, error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

async function deleteReciept(req, res) {
    try {
        const receipt_id = req.params.receipt_id;
        const deleted = await ReceiptItem.deleteReceipt(receipt_id);
        if (deleted) {
            res.status(200).json({ message: "Receipt deleted successfully" });
        } else {
            logger.warn(`Receipt with ID ${receipt_id} not found`);
            res.status(404).json({ message: "Receipt not found" });
        }
    } catch (error) {
        logger.error(`Error in deleteReciept: ${error.message}`, error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error deleting receipt" });
        }
    }
}

async function getAllReceipts(req, res, next) {
    try {
        const data = await ReceiptItem.getReceipts();
        data.forEach(receipt => {
            if (typeof receipt.service === "string") {
                receipt.service = JSON.parse(receipt.service).join(", ");
            }

            // Format phone numbers to replace '0' with '256'
            if (receipt.patient_phone.startsWith('0')) {
                receipt.patient_phone = '256' + receipt.patient_phone.slice(1);
            }
        });

        if (req.user.usertype === 'admin') {
            return res.render("adminReceipts", {
                title: "Admin Receipts",
                receipts: data,
                user: req.user
            });
        } else {
            return res.render("receipts", {
                title: "Receipts List",
                receipts: data,
                user: req.user
            });
        }
    } catch (error) {
        logger.error(`Error in getAllReceipts: ${error.message}`, error);
        next(error);
    }
}

async function receiptDetails(req, res, next) {
    try {
        const receipt_id = req.params.receipt_id;
        const data = await ReceiptItem.getReceiptDetails(receipt_id);
        if (!data) {
            logger.warn(`Receipt details not found for ID ${receipt_id}`);
            return res.status(404).json({ message: "Receipt not found" });
        }

        if (typeof data.service === "string") {
            data.service = JSON.parse(data.service).join(", ");
        }

        return res.render("receiptDetails", {
            title: "Receipt Details",
            receipt: data,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in receiptDetails: ${error.message}`, error);
        next(error);
    }
}

async function updateReceipt(req, res) {
    try {
        const receipt_id = req.params.receipt_id;
        const { patient_name, patient_phone, service, qty, discount, amount, total, mode_of_payment, amount_paid, balance } = req.body;

        // Fetch the receipt details to pre-fill the form
        const receipt = await ReceiptItem.getReceiptDetails(receipt_id);
        if (!receipt) {
            logger.warn(`Receipt with ID ${receipt_id} not found`);
            return res.status(404).json({ message: "Receipt not found" });
        }

        const updated = await ReceiptItem.updateReceipt(
            receipt_id,
            patient_name,
            patient_phone,
            service,
            qty || 1,
            discount || 0,
            amount || total || 0,
            total || 0,
            mode_of_payment,
            amount_paid || 0,
            balance || 0
        );

        if (updated) {
            res.status(200).render("receiptEdit", {
                message: "Receipt updated successfully",
                receipt, // Pass the receipt object to the view
                user: req.user
            });
        } else {
            logger.warn(`Receipt with ID ${receipt_id} not updated`);
            res.status(404).json({ message: "Receipt not updated" });
        }
    } catch (error) {
        logger.error(`Error in updateReceipt: ${error.message}`, error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error updating receipt" });
        }
    }
}

module.exports = { addReceipt, getAllReceipts, receiptDetails, deleteReciept, updateReceipt };

