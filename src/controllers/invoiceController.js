const InvoiceModel = require("../models/invoiceModel");
const logger = require("../utils/logger");

async function buildInvoice(req, res) {
    try {
        res.render("invoice", {
            title: "Create Invoice",
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in buildInvoice: ${error.message}`, error);
        res.status(500).json({ message: "Error loading invoice form" });
    }
}

async function addInvoice(req, res) {
    try {
        const { client_name, client_address, client_tel, invoice_date, total, items } = req.body;
        
        // Parse items if it's a string
        let parsedItems = items;
        if (typeof items === 'string') {
            parsedItems = JSON.parse(items);
        }

        const invoice = await InvoiceModel.createInvoice(
            client_name,
            client_address,
            client_tel,
            invoice_date,
            total,
            parsedItems
        );

        if (invoice) {
            const data = await InvoiceModel.getInvoices();
            res.status(201).render("invoices", {
                title: "Invoices",
                invoices: data,
                user: req.user,
                message: "Invoice created successfully"
            });
        } else {
            logger.error("Failed to add invoice: Database operation returned null");
            res.status(500).json({ message: "Error adding invoice" });
        }
    } catch (error) {
        logger.error(`Error in addInvoice: ${error.message}`, error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteInvoice(req, res) {
    try {
        const invoice_id = req.params.invoice_id;
        const deleted = await InvoiceModel.deleteInvoice(invoice_id);
        if (deleted) {
            res.status(200).json({ message: "Invoice deleted successfully" });
        } else {
            logger.warn(`Invoice with ID ${invoice_id} not found`);
            res.status(404).json({ message: "Invoice not found" });
        }
    } catch (error) {
        logger.error(`Error in deleteInvoice: ${error.message}`, error);
        res.status(500).json({ message: "Error deleting invoice" });
    }
}

async function getAllInvoices(req, res, next) {
    try {
        const data = await InvoiceModel.getInvoices();
        
        return res.render("invoices", {
            title: "Invoices List",
            invoices: data,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in getAllInvoices: ${error.message}`, error);
        next(error);
    }
}

async function invoiceDetails(req, res, next) {
    try {
        const invoice_id = req.params.invoice_id;
        const data = await InvoiceModel.getInvoiceDetails(invoice_id);
        if (!data) {
            logger.warn(`Invoice details not found for ID ${invoice_id}`);
            return res.status(404).json({ message: "Invoice not found" });
        }

        return res.render("invoiceDetails", {
            title: "Invoice Details",
            invoice: data,
            user: req.user
        });
    } catch (error) {
        logger.error(`Error in invoiceDetails: ${error.message}`, error);
        next(error);
    }
}

async function updateInvoice(req, res) {
    try {
        const invoice_id = req.params.invoice_id;
        const { client_name, client_address, client_tel, invoice_date, total, status } = req.body;

        // Fetch the invoice details to pre-fill the form
        const invoice = await InvoiceModel.getInvoiceDetails(invoice_id);
        if (!invoice) {
            logger.warn(`Invoice with ID ${invoice_id} not found`);
            return res.status(404).json({ message: "Invoice not found" });
        }

        const updated = await InvoiceModel.updateInvoice(
            invoice_id,
            client_name,
            client_address,
            client_tel,
            invoice_date,
            total,
            status || 'draft'
        );

        if (updated) {
            res.status(200).render("invoiceEdit", {
                message: "Invoice updated successfully",
                invoice,
                user: req.user
            });
        } else {
            logger.warn(`Invoice with ID ${invoice_id} not updated`);
            res.status(404).json({ message: "Invoice not updated" });
        }
    } catch (error) {
        logger.error(`Error in updateInvoice: ${error.message}`, error);
        res.status(500).json({ message: "Error updating invoice" });
    }
}

async function updateInvoiceStatus(req, res) {
    try {
        const invoice_id = req.params.invoice_id;
        const { status } = req.body;

        const updated = await InvoiceModel.updateInvoiceStatus(invoice_id, status);

        if (updated) {
            res.status(200).json({ message: "Invoice status updated successfully" });
        } else {
            logger.warn(`Invoice with ID ${invoice_id} not found`);
            res.status(404).json({ message: "Invoice not found" });
        }
    } catch (error) {
        logger.error(`Error in updateInvoiceStatus: ${error.message}`, error);
        res.status(500).json({ message: "Error updating invoice status" });
    }
}

module.exports = { 
    buildInvoice,
    addInvoice, 
    getAllInvoices, 
    invoiceDetails, 
    deleteInvoice, 
    updateInvoice,
    updateInvoiceStatus
};
