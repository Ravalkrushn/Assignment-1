import { SupportTicket } from '../models/SupportTicket.js';
import { logAdminActivity } from '../utils/auditLogger.js';
import { apiResponse } from '../utils/apiResponse.js';

export const createTicket = async (req, res, next) => {
  try {
    const {
      issueCategory,
      subject,
      description,
      relatedProductCode,
      relatedRedemptionId,
      priority = 'Medium'
    } = req.body;

    if (!subject || !description) {
      return apiResponse.error(res, 'Subject and description are required.', [], 400);
    }

    const ticketId = `TICK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await SupportTicket.create({
      ticketId,
      userId: req.user._id,
      customerName: req.user.fullName,
      customerEmail: req.user.email,
      issueCategory: issueCategory || 'Other',
      subject: subject.trim(),
      description: description.trim(),
      relatedProductCode: (relatedProductCode || '').trim(),
      relatedRedemptionId: (relatedRedemptionId || '').trim(),
      priority,
      status: 'Open',
      messages: [
        {
          senderId: req.user._id,
          senderName: req.user.fullName,
          senderRole: 'customer',
          message: description.trim(),
          isInternalNote: false,
          createdAt: new Date()
        }
      ]
    });

    return apiResponse.success(res, 'Support ticket created successfully.', { ticket }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Filter out internal notes for customer
    const sanitized = tickets.map((t) => {
      const obj = t.toObject();
      obj.messages = obj.messages.filter((m) => !m.isInternalNote);
      return obj;
    });

    return apiResponse.success(res, 'My support tickets.', {
      tickets: sanitized,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return apiResponse.error(res, 'Support ticket not found.', [], 404);
    }

    // Ownership check
    if (req.user.role !== 'admin' && ticket.userId.toString() !== req.user._id.toString()) {
      return apiResponse.error(res, 'Access denied.', [], 403);
    }

    const obj = ticket.toObject();
    if (req.user.role !== 'admin') {
      obj.messages = obj.messages.filter((m) => !m.isInternalNote);
    }

    return apiResponse.success(res, 'Support ticket details.', { ticket: obj });
  } catch (error) {
    next(error);
  }
};

export const replyTicket = async (req, res, next) => {
  try {
    const { message, isInternalNote = false } = req.body;
    if (!message || !message.trim()) {
      return apiResponse.error(res, 'Message text is required.', [], 400);
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return apiResponse.error(res, 'Support ticket not found.', [], 404);
    }

    // Authorization
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && ticket.userId.toString() !== req.user._id.toString()) {
      return apiResponse.error(res, 'Access denied.', [], 403);
    }

    if (!isAdmin && isInternalNote) {
      return apiResponse.error(res, 'Customers cannot add internal notes.', [], 403);
    }

    ticket.messages.push({
      senderId: req.user._id,
      senderName: req.user.fullName,
      senderRole: isAdmin ? 'admin' : 'customer',
      message: message.trim(),
      isInternalNote: isAdmin ? Boolean(isInternalNote) : false,
      createdAt: new Date()
    });

    // Update status appropriately
    if (!isInternalNote) {
      if (isAdmin) {
        ticket.status = 'Waiting for Customer';
      } else {
        if (ticket.status === 'Waiting for Customer') {
          ticket.status = 'In Progress';
        }
      }
    }

    await ticket.save();

    if (isAdmin) {
      await logAdminActivity({
        admin: req.user,
        actionType: isInternalNote ? 'SUPPORT_NOTE_ADDED' : 'SUPPORT_TICKET_REPLY',
        module: 'Support',
        targetId: ticket._id,
        description: `${isInternalNote ? 'Added internal note' : 'Replied'} to ticket ${ticket.ticketId} (${ticket.customerName})`,
        metadata: { ticketId: ticket.ticketId, isInternalNote },
        req
      });
    }

    return apiResponse.success(res, 'Reply appended to ticket.', { ticket });
  } catch (error) {
    next(error);
  }
};

export const getAllTickets = async (req, res, next) => {
  try {
    const { status, issueCategory, priority, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') query.status = status;
    if (issueCategory && issueCategory !== 'ALL') query.issueCategory = issueCategory;
    if (priority && priority !== 'ALL') query.priority = priority;

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { relatedProductCode: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return apiResponse.success(res, 'All support tickets retrieved.', {
      tickets,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, resolutionDetails } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'];

    if (!validStatuses.includes(status)) {
      return apiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, [], 400);
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return apiResponse.error(res, 'Support ticket not found.', [], 404);
    }

    const previousStatus = ticket.status;
    ticket.status = status;

    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolutionDetails = resolutionDetails ? resolutionDetails.trim() : (ticket.resolutionDetails || 'Resolved by support team.');
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user.fullName || 'Admin';
    }

    await ticket.save();

    await logAdminActivity({
      admin: req.user,
      actionType: 'SUPPORT_STATUS_UPDATE',
      module: 'Support',
      targetId: ticket._id,
      description: `Updated ticket ${ticket.ticketId} status from "${previousStatus}" to "${status}"`,
      metadata: { ticketId: ticket.ticketId, previousStatus, newStatus: status },
      req
    });

    return apiResponse.success(res, `Ticket status updated to "${status}".`, { ticket });
  } catch (error) {
    next(error);
  }
};
