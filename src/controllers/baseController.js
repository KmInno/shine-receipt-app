const baseController = {}
const ReceiptModel = require("../models/receiptModel");
const InvoiceModel = require("../models/invoiceModel");
const logger = require("../utils/logger");

baseController.buildHome = async function (req, res, next) {
    try {
        // Fetch statistics
        const receipts = await ReceiptModel.getReceipts();
        const invoices = await InvoiceModel.getInvoices();

        // If user is not an admin, show a simplified dashboard
        if (req.user && req.user.usertype && req.user.usertype !== 'admin') {
            const recentReceipts = receipts.slice(-5).reverse();
            const recentInvoices = invoices.slice(-5).reverse();
            return res.render("simpleDashboard", {
                title: "Dashboard",
                user: req.user,
                recentReceipts,
                recentInvoices,
                receiptsCount: receipts.length,
                invoicesCount: invoices.length
            });
        }

        // Calculate stats
        const totalReceipts = receipts.length;
        const totalInvoices = invoices.length;
        
        const totalReceiptAmount = receipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
        const totalInvoiceAmount = invoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
        
        const totalReceiptBalance = receipts.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);
        
        const paidInvoices = invoices.filter(i => i.status === 'paid').length;
        const sentInvoices = invoices.filter(i => i.status === 'sent').length;
        const draftInvoices = invoices.filter(i => i.status === 'draft').length;

        // Get recent items (last 5)
        const recentReceipts = receipts.slice(-5).reverse();
        const recentInvoices = invoices.slice(-5).reverse();

        res.render("dashboard", {
            title: "Dashboard",
            user: req.user,
            stats: {
                totalReceipts,
                totalInvoices,
                totalReceiptAmount: totalReceiptAmount.toFixed(2),
                totalInvoiceAmount: totalInvoiceAmount.toFixed(2),
                totalReceiptBalance: totalReceiptBalance.toFixed(2),
                paidInvoices,
                sentInvoices,
                draftInvoices
            },
            recentReceipts,
            recentInvoices
        });
    } catch (error) {
        logger.error(`Error in buildHome: ${error.message}`, error);
        next(error);
    }
}

baseController.buildReceipt = async function (req, res, next) {
    res.render("receipt", {
        title: "Receipt Form"
    });
    next();
}

module.exports = baseController;

// Render a blank page with logo (simple template)
baseController.buildBlank = async function (req, res, next) {
    try {
        return res.render('blank_template', {
            title: 'Blank',
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in buildBlank: ${error.message}`, error);
        next(error);
    }
}