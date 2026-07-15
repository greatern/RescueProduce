import { Request, Response } from "express";
import { FraudCase } from "../models/fraud_case";
import { Task } from "../models/task";
import { Claim } from "../models/claim";
import { User } from "../models/user";
import { Penalty } from "../models/penalty";
import { Blocklist } from "../models/blocklist";
import { Notification, NOTIF_TYPE } from "../models/notification";
import { FoodListing } from "../models/food_listing";
import { Donor } from "../models/donor";
import { Volunteer } from "../models/volunteer";
import { responseUtils } from "../utils/response";
import path from "path";
import fs from "fs";
import { NotificationService } from "../service/notificationsService";
import cron from 'node-cron';
import { Appeal } from "../models/appeal";
import { sequelize } from "../config/sequelize";
import { Op } from "sequelize";

interface ResolutionAction {
  type: 'warning' | 'penalty' | 'block' | 'dismiss' | 'resolve';
  target_user_id?: string;
  target_role?: 'volunteer' | 'donor' | 'reporter';
  severity: 'low' | 'medium' | 'high';
  message: string;
  duration?: number;
  points?: number;
}

interface FraudResolutionAnalytic {
  case_id: string;
  resolution_type: string;
  severity: string;
  duration_open: number;
  evidence_count: number;
  action_taken?: string;
  target_user_type?: string;
}

class FraudCaseHandler {
  
  constructor() {
 
    this.createReport = this.createReport.bind(this);
    this.getReports = this.getReports.bind(this);
    this.getReportById = this.getReportById.bind(this);
    this.resolveReport = this.resolveReport.bind(this);
    this.reopenCase = this.reopenCase.bind(this);
    this.debugDatabaseState = this.debugDatabaseState.bind(this);
  }

 private validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const allowedTransitions: { [key: string]: string[] } = {
      'open': ['under_investigation', 'resolved', 'dismissed'],
      'under_investigation': ['resolved', 'dismissed', 'reopened'],
      'resolved': ['reopened'],
      'dismissed': ['reopened'],
      'reopened': ['under_investigation', 'resolved', 'dismissed']
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

 private validateActionConsistency(action: ResolutionAction, fraudCase: FraudCase): { isValid: boolean; error?: string } {
    if (action.type !== 'dismiss' && action.type !== 'resolve' && !action.target_user_id) {
      return { isValid: false, error: 'Target user ID is required for warnings, penalties, and blocks' };
    }

    if (action.type === 'dismiss' && action.target_user_id) {
      return { isValid: false, error: 'Cannot take action on a user when dismissing a case' };
    }

    if (action.severity === 'high' && action.type === 'warning') {
      return { isValid: false, error: 'High severity warnings are not allowed. Use penalty instead.' };
    }

    if (action.type !== 'penalty' && action.points) {
      return { isValid: false, error: 'Points can only be specified for penalties' };
    }

    if (action.type !== 'block' && action.duration) {
      return { isValid: false, error: 'Duration can only be specified for blocks' };
    }

    return { isValid: true };
  }

private async validateActionTarget(
  action: ResolutionAction, 
  fraudCase: FraudCase, 
  transaction?: any
): Promise<{ isValid: boolean; error?: string; targetUser?: User }> {
  
  if (!action.target_user_id) {
    return { isValid: true };
  }

  console.log(`🔍 Validating target user: ${action.target_user_id} for case: ${fraudCase.id}`);

  const options = transaction ? { transaction } : {};
  const targetUser = await User.findByPk(action.target_user_id, options);
  
  if (!targetUser) {
    return { isValid: false, error: `Target user ${action.target_user_id} not found` };
  }

  console.log(`Found target user: ${targetUser.name} (${targetUser.user_type})`);

  // Get all involved parties
  const involvedParties = await this.getInvolvedParties(fraudCase, transaction);
  console.log(`📋 Involved parties in case:`, involvedParties.map(p => `${p.name} (${p.user_type})`));
  
  const isInvolved = involvedParties.some(party => party.id === action.target_user_id);
  
  if (!isInvolved) {
    const involvedNames = involvedParties.map(p => `${p.name} (${p.user_type})`).join(', ');
    return { 
      isValid: false, 
      error: `User ${targetUser.name} is not involved in this fraud case. Involved parties: ${involvedNames || 'none found'}` 
    };
  }

  console.log(`✅ User ${targetUser.name} is involved in the case`);

  if (fraudCase.reported_party && fraudCase.reported_party !== targetUser.user_type) {
    console.warn(`⚠️ User role ${targetUser.user_type} doesn't match reported party ${fraudCase.reported_party}`);
  }

  if (action.target_role && action.target_role !== targetUser.user_type) {
    console.warn(`⚠️ Target role ${action.target_role} doesn't match user's actual role ${targetUser.user_type}`);
  }

  return { isValid: true, targetUser };
}


private detectCaseSeverity(description: string, issueType: string): 'low' | 'medium' | 'high' {
    const highSeverityKeywords = ['fraud', 'steal', 'theft', 'fake', 'forgery', 'scam', 'cheat'];
    const mediumSeverityKeywords = ['late', 'delay', 'damage', 'missing', 'poor quality', 'incomplete'];
    
    const text = `${description} ${issueType}`.toLowerCase();
    
    if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

 private getResolutionTemplate(actionType: string, severity: string): string {
    const templates: { [key: string]: { [key: string]: string } } = {
      'warning': {
        'low': 'Issued a warning for minor infraction. Future violations may result in penalties.',
        'medium': 'Formal warning issued for violation of platform rules. Continued issues will lead to account penalties.',
        'high': 'Final warning issued for serious violation. Any further issues will result in account suspension.'
      },
      'penalty': {
        'low': 'Points deducted for rule violation. User should review platform guidelines.',
        'medium': 'Significant penalty applied for repeated/moderate violations.',
        'high': 'Maximum penalty applied for serious platform violation.'
      },
      'block': {
        'low': 'Temporary restriction applied to account functionality.',
        'medium': 'Account temporarily suspended due to violations.',
        'high': 'Account blocked for serious platform abuse.'
      },
      'dismiss': { 'default': 'Case dismissed due to lack of evidence or false reporting.' },
      'resolve': { 'default': 'Case resolved successfully without further action.' }
    };

    if (templates[actionType] && typeof templates[actionType] === 'object' && !(severity in templates[actionType])) {
      return templates[actionType]['default'] || 'Case resolved with appropriate action.';
    }
    return templates[actionType]?.[severity] || 'Case resolved with appropriate action.';
  }

public async createReport(req: Request, res: Response) {
    const transaction = await FraudCase.sequelize!.transaction();
    
    try {
      console.log('📝 Creating fraud case report...');
      const { claimId, description, issueType, reporter_id } = req.body;
      
      if (!claimId || !description || !issueType || !reporter_id) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 400, 
          "Missing required fields: claimId, description, issueType, reporter_id");
      }

      // Validate reporter exists
      const reporter = await User.findByPk(reporter_id, { transaction });
      if (!reporter) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "Reporter user not found");
      }

      // Validate claim exists
      const claim = await Claim.findByPk(claimId, { transaction });
      if (!claim) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "Claim not found");
      }

      // Get associated task
      const task = await Task.findOne({ 
        where: { claim_id: claimId },
        transaction 
      });
      if (!task) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "No task found for this claim");
      }

      // Process evidence files
      let evidenceFiles: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
          const filePath = path.join(process.cwd(), 'uploads', file.filename);
          if (fs.existsSync(filePath)) {
            evidenceFiles.push(file.filename);
          }
        }
      }

      // Auto-detect severity
      const detectedSeverity = this.detectCaseSeverity(description, issueType);

      // Create fraud case
      const fraudCase = await FraudCase.create({
        task_id: task.id,
        claim_id: claimId,
        reporter_id: reporter_id,
        description: description,
        issue_type: issueType,
        evidence_files: evidenceFiles,
        status: "open",
        severity_level: detectedSeverity,
      }, { transaction });

      // Escalate high severity cases
      if (detectedSeverity === 'high') {
        await this.escalateCaseIfNeeded(fraudCase, transaction);
      }

      await transaction.commit();

      console.log('✅ Fraud case created successfully:', fraudCase.id);
      return responseUtils.sendSuccessResponse(res, 201, {
        id: fraudCase.id,
        message: "Issue reported successfully",
        caseNumber: `CASE-${fraudCase.id.slice(-8).toUpperCase()}`,
        filesProcessed: evidenceFiles.length,
        detectedSeverity: detectedSeverity,
        suggestedActions: this.suggestActionBasedOnSeverity(detectedSeverity, evidenceFiles.length)
      }, "Issue reported successfully");

    } catch (error: any) {
      await transaction.rollback();
      console.error('❌ Error creating fraud case:', error.message);
      return responseUtils.sendErrorResponse(res, 500, "Could not create the report", error);
    }
  }

 public async getReports(req: Request, res: Response) {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (severity) whereClause.severity_level = severity;

    const reports = await FraudCase.findAll({
      where: whereClause,
      attributes: [
        'id', 'reporter_id', 'task_id', 'claim_id', 'description', 
        'issue_type', 'evidence_files', 'severity_level', 'status',
        'date_reported', 'date_resolved', 'date_reopened',
        'resolution_details', 'created_at', 'updated_at'
      ],
      include: [
        { 
          model: User, 
          as: 'reporter', 
          attributes: ['id', 'name', 'email', 'phone', 'user_type'] 
        },
        { 
          model: Task, 
          as: 'task', 
          attributes: ['id', 'title', 'status', 'due_date', 'assigned_volunteer_id'],
          include: [
            {
              model: Volunteer,
              as: 'volunteer',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email', 'phone', 'user_type']
                }
              ]
            }
          ]
        },
        { 
          model: Claim, 
          as: 'claim', 
          attributes: ['id'],
          include: [
            {
              model: FoodListing,
              as: 'food_listing',
              attributes: ['id', 'donor_id'],
              include: [
                {
                  model: Donor,
                  as: 'donor',
                  attributes: ['id'],
                  include: [
                    {
                      model: User,
                      as: 'user',
                      attributes: ['id', 'name', 'email', 'phone', 'user_type']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });


    const transformedReports = reports.map(report => {
      const reportData = report.toJSON();

      if (reportData.task?.volunteer?.user) {
        reportData.task.assigned_volunteer = reportData.task.volunteer.user;
      }
      
      if (reportData.claim?.food_listing?.donor?.user) {
        reportData.claim.food_listing.donor_user = reportData.claim.food_listing.donor.user;
      }
      
      return reportData;
    });

    // Get analytics for admind page dashboard
    const analytics = await this.getFraudAnalytics();

    return responseUtils.sendSuccessResponse(res, 200, {
      reports: transformedReports,
      analytics,
      pagination: {
        total: reports.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    }, "Reports fetched successfully");

  } catch (error: any) {
    console.error('❌ Error fetching reports:', error.message);
    return responseUtils.sendErrorResponse(res, 500, "Error fetching reports", error);
  }
}
 public async getReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await FraudCase.findByPk(id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email', 'phone'] },
        { 
          model: Task, 
          as: 'task',
          attributes: ['id', 'title', 'status', 'due_date', 'assigned_volunteer_id'],
          include: [
            {
              model: Volunteer,
              as: 'volunteer',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email', 'phone', 'user_type']
                }
              ]
            }
          ]
        },
        {
          model: Claim,
          as: 'claim',
          include: [{
            model: FoodListing,
            as: 'food_listing',
            include: [{
              model: Donor,
              as: 'donor',
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'user_type']
              }]
            }]
          }]
        }
      ]
    });
    
    if (!report) {
      return responseUtils.sendErrorResponse(res, 404, "Report not found");
    }

    const involvedParties = await this.getInvolvedParties(report);
    
    return responseUtils.sendSuccessResponse(res, 200, {
      report,
      involvedParties,
      suggestedActions: this.suggestActionBasedOnSeverity(report.severity_level, report.evidence_files.length)
    }, "Report fetched successfully");

  } catch (error) {
    console.error("Error fetching report:", error);
    return responseUtils.sendErrorResponse(res, 500, "Error fetching report", error);
  }
}
  private async applyPenalty(userId: string, action: any, transaction: any) {
  console.log(`Applying penalty to user ${userId}:`, action);

  await Penalty.create({
    user_id: userId,
    type: action.penalty_type || 'warning',
    reason: action.reason || 'Penalty due to fraud case',
    points_deducted: action.points || 0,
    date_issued: new Date()
  }, { transaction });
  
 const user = await User.findByPk(userId, { transaction });
  if (user && 'points' in user && action.points) {
    user.points = Math.max(0, (Number(user.points) || 0) - action.points);
    await user.save({ transaction });
  }
}

public async resolveReport(req: Request, res: Response) {
  console.log('🔍 RESOLVE REQUEST BODY:', JSON.stringify(req.body, null, 2));
  console.log('🔍 RESOLVE PARAMS:', req.params);
  
  const transaction = await FraudCase.sequelize!.transaction();

  try {
    const { id } = req.params;
    const { resolution_details, status, action_taken, admin_id } = req.body;

    console.log('📋 Fetching fraud case:', id);
    
    // Fetch fraud case with relations
    const fraudCase = await FraudCase.findByPk(id, {
      include: [
        { model: User, as: 'reporter' },
        { 
          model: Task, 
          as: 'task', 
          include: [{ 
            model: Volunteer, 
            as: 'volunteer', 
            include: [{ model: User, as: 'user' }] 
          }] 
        },
        { 
          model: Claim, 
          as: 'claim', 
          include: [{ 
            model: FoodListing, 
            as: 'food_listing', 
            include: [{ 
              model: Donor, 
              as: 'donor', 
              include: [{ model: User, as: 'user' }] 
            }] 
          }] 
        }
      ],
      transaction
    });

    if (!fraudCase) {
      console.error('❌ Fraud case not found:', id);
      await transaction.rollback();
      return responseUtils.sendErrorResponse(res, 404, "Fraud case not found");
    }

    console.log('✅ Found fraud case:', fraudCase.id, 'current status:', fraudCase.status);

    if (status && !this.validateStatusTransition(fraudCase.status, status)) {
      console.error('❌ Invalid status transition:', fraudCase.status, '->', status);
      await transaction.rollback();
      return responseUtils.sendErrorResponse(res, 400, 
        `Invalid status transition from ${fraudCase.status} to ${status}`);
    }

  
    fraudCase.status = status || "resolved";
    fraudCase.resolution_details = resolution_details || 
      this.getResolutionTemplate(action_taken?.type || 'resolve', fraudCase.severity_level);
    fraudCase.date_resolved = new Date();
    
    console.log('Saving fraud case with new status:', fraudCase.status);
    await fraudCase.save({ transaction });

    // Handle actions if provided
    if (action_taken && action_taken.target_user_id) {
      console.log('⚡ Processing action:', action_taken.type, 'for user:', action_taken.target_user_id);
      
      const targetUserId = action_taken.target_user_id;

      if (action_taken.type === 'temporarily_block') {
        console.log('Processing temporary block...');
        const blockDuration = parseInt(action_taken.duration) || 7;

        // Check if user already has an active block
        const existingBlock = await Blocklist.findOne({
          where: { user_id: targetUserId, is_active: true },
          transaction
        });

        if (existingBlock) {
          console.log(' Updating existing block for user', targetUserId);
          existingBlock.block_duration = blockDuration;
          existingBlock.reason = action_taken.reason || existingBlock.reason;
          existingBlock.appeal_status = 'pending';
          existingBlock.date_blocked = new Date();
          await existingBlock.save({ transaction });
        } else {
          console.log('✅ Creating new block for user', targetUserId);
          await Blocklist.create({
            user_id: targetUserId,
            admin_id: admin_id || 'system',
            reason: action_taken.reason || 'Temporary block due to fraud case',
            date_blocked: new Date(),
            block_duration: blockDuration,
            appeal_status: 'pending',
            is_active: true
          }, { transaction });
        }

        // Send appeal notification
        const appealLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/volunteer/appeal/${id}`;
        await NotificationService.sendWarningNotification(
          targetUserId,
          id,
          `BLOCK-APPEAL`,
          `You have been temporarily blocked for ${blockDuration} day(s). You can submit an appeal here: ${appealLink}`
        );

        console.log(`📧 Appeal notification sent to user ${targetUserId}: ${appealLink}`);

        // Reassign tasks for blocked volunteer
        await this.reassignTasksForBlockedVolunteer(targetUserId, transaction);
      }

      if (action_taken.type === 'apply_penalty') {
        console.log('⚠️ Applying penalty...');
        const penaltyPoints = parseInt(action_taken.points) || 10;
        await this.applyPenalty(targetUserId, {
          ...action_taken,
          points: penaltyPoints
        }, transaction);
        console.log('✅ Penalty applied:', penaltyPoints, 'points');
      }

      if (action_taken.type === 'warning') {
        console.log('⚠️ Issuing warning (handled via notifications only)');
      }
    }

    // Send notifications to all involved parties
    await this.safeSendResolutionNotifications(
      id, 
      fraudCase, 
      action_taken, 
      transaction
    );

    await transaction.commit();
    console.log('✅ Transaction committed successfully');

    // Fetch updated case
    const updatedCase = await FraudCase.findByPk(id, {
      include: [
        { model: User, as: 'reporter' },
        { model: Task, as: 'task' },
        { model: Claim, as: 'claim' }
      ]
    });
    
    return responseUtils.sendSuccessResponse(res, 200, 
      { fraudCase: updatedCase }, 
      "Fraud case resolved successfully. Notifications sent to all parties.");

  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ ERROR RESOLVING FRAUD CASE:", error.message);
    console.error("❌ FULL ERROR:", error);
    console.error("❌ STACK TRACE:", error.stack);
    return responseUtils.sendErrorResponse(res, 500, "Error resolving fraud case", error);
  }
}
public async reopenCase(req: Request, res: Response) {
    const transaction = await FraudCase.sequelize!.transaction();
    
    try {
      const { id } = req.params;
      const { reason, new_evidence } = req.body;

      const fraudCase = await FraudCase.findByPk(id, { transaction });
      
      if (!fraudCase) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "Case not found");
      }

      if (!['resolved', 'dismissed'].includes(fraudCase.status)) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 400, "Only resolved or dismissed cases can be reopened");
      }

      fraudCase.status = 'reopened' as any;
      fraudCase.reopened_reason = reason;
      fraudCase.date_reopened = new Date();
      
      // Add new evidence if provided
      if (new_evidence && Array.isArray(new_evidence)) {
        fraudCase.evidence_files = [...(fraudCase.evidence_files || []), ...new_evidence];
      }

      await fraudCase.save({ transaction });

      // Notify original parties
      await this.notifyCaseReopened(id, fraudCase, transaction);

      await transaction.commit();
      
      return responseUtils.sendSuccessResponse(res, 200, fraudCase, "Case reopened successfully");

    } catch (error: any) {
      await transaction.rollback();
      console.error("❌ Error reopening case:", error.message);
      return responseUtils.sendErrorResponse(res, 500, "Error reopening case", error);
    }
  }
 private async applyConsequence(caseId: string, action: ResolutionAction, fraudCase: FraudCase, transaction: any): Promise<void> {
    if (!action.target_user_id) return;
    const targetUser = await User.findByPk(action.target_user_id, { transaction });
    if (!targetUser) throw new Error(`Target user not found: ${action.target_user_id}`);

    switch (action.type) {
      case 'penalty':
        await Penalty.create({
          user_id: action.target_user_id,
          reason: `Fraud case ${caseId}: ${action.message}`,
          severity: action.severity,
          points_deducted: action.points || 10,
          effective_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          issued_by_id: 'system'
        }, { transaction });
        break;

      case 'block':
        const blockDate = new Date(Date.now() + (action.duration || 7) * 24 * 60 * 60 * 1000);
        if ((action.duration || 0) === 0) {
          await Blocklist.create({
            user_id: action.target_user_id,
            reason: `Fraud case ${caseId}: ${action.message}`,
            block_duration: 0,
            appeal_status: 'none',
            admin_id: 'system',
            date_blocked: new Date()
          }, { transaction });
        }

 await this.reassignTasksForBlockedVolunteer(action.target_user_id, transaction);

        break;

      case 'warning':
        break;

      default:
        return;
    }

    await NotificationService.sendWarningNotification(
      action.target_user_id,
      caseId,
      `CASE-${caseId.slice(-8).toUpperCase()}`,
      action.message
    );

    const totalPoints = await this.getTotalPenaltyPoints(action.target_user_id, transaction);
    if (totalPoints >= 100) {
      await Blocklist.create({
        user_id: action.target_user_id,
        reason: 'Exceeded maximum penalty points',
        block_duration: 30,
        appeal_status: 'none',
        admin_id: 'system',
        date_blocked: new Date()
      }, { transaction });
    }
  }
  
private async reassignTasksForBlockedVolunteer(volunteerId: string, transaction: any) {
    const tasks = await Task.findAll({ where: { assigned_volunteer_id: volunteerId, status: 'open' }, transaction });

    for (const task of tasks) {
      const backupVolunteer = await Volunteer.findOne({ where: { is_available: true }, include: [User], transaction });
      if (backupVolunteer) {
        task.assigned_volunteer_id = backupVolunteer.id;
        await task.save({ transaction });
        await NotificationService.sendFraudCaseResolution(
          backupVolunteer.user.id,
          task.id,
          `TASK-${task.id.slice(-8).toUpperCase()}`,
          'assigned',
          'reassigned'
        );
        console.log(`✅ Task ${task.id} reassigned to ${backupVolunteer.user.name}`);
      } else {
        console.warn(`⚠️ No backup volunteer available for task ${task.id}`);
      }
    }
  }

  // --------------------- HELPER METHODS ---------------------
  private async getTotalPenaltyPoints(userId: string, transaction?: any): Promise<number> {
    const options = transaction ? { transaction } : {};
    const penalties = await Penalty.findAll({ where: { user_id: userId }, ...options });
    return penalties.reduce((sum, p) => sum + Number(p.points_deducted || 0), 0);
  }

private async scheduleTemporaryBlock(
  userId: string,
  durationDays: number,
  caseId: string,
  reason: string,
  transaction: any
) {
  const now = new Date();
  const blockStartDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days to allow appeal
  const blockEndDate = new Date(blockStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const block = await Blocklist.create({
    user_id: userId,
    reason,
    block_duration: durationDays,
    appeal_status: 'pending',
    block_date: blockStartDate,
    unblock_date: blockEndDate,
    admin_id: 'system',
    date_blocked: now,
    is_active: true
  }, { transaction });

  // Generate appeal link
  const appealLink = `http://localhost:5173/volunteer/appeal/${block.id}?case=${caseId}`;

  // Send appeal notification
  await NotificationService.sendWarningNotification(
    userId,
    caseId,
    'TEMP_BLOCK_APPEAL',
    `You are scheduled to be temporarily blocked in 3 days. Submit an appeal here: ${appealLink}`
  );

  console.log(`✅ Temporary block scheduled for user ${userId}, appeal notification sent.`);

  // Immediately reassign tasks for blocked volunteer
  await this.reassignTasksForBlockedVolunteer(userId, transaction);

  // Schedule account status changes
  this.scheduleAccountStatusChange(userId, blockStartDate, false); // deactivate
  this.scheduleAccountStatusChange(userId, blockEndDate, true);     // reactivate
}


private scheduleAccountStatusChange(userId: string, changeDate: Date, isActive: boolean) {
  const cron = require('node-cron');

  const now = new Date();
  if (changeDate <= now) {

   User.update({ is_active: isActive }, { where: { id: userId } });
    console.log(`✅ User ${userId} is now ${isActive ? 'active' : 'inactive'}`);
    return;
  }

  const runAt = `${changeDate.getUTCMinutes()} ${changeDate.getUTCHours()} ${changeDate.getUTCDate()} ${changeDate.getUTCMonth() + 1} *`;
  
  cron.schedule(runAt, async () => {
    await User.update({ is_active: isActive }, { where: { id: userId } });
    console.log(`✅ Scheduled account status change: user ${userId} is now ${isActive ? 'active' : 'inactive'}`);
  });
}


  // ==================== PERMANENT BLOCK ====================
  private async blockUserPermanently(userId: string, reason: string, transaction: any) {
    await Blocklist.create({
      user_id: userId,
      reason,
      block_duration: null,
      appeal_status: 'none',
      admin_id: 'system',
      date_blocked: new Date()
    }, { transaction });

    await NotificationService.sendWarningNotification(
      userId,
      'PERMANENT_BLOCK',
      'PERMANENT_BLOCK',
      `Your account has been permanently blocked. Reason: ${reason}`
    );

    // Reassign tasks
    await this.reassignTasksForBlockedVolunteer(userId, transaction);

    console.log(`🚫 User ${userId} permanently blocked`);
  }

  // ==================== CRON JOB FOR 3-DAY APPEAL NOTIFICATIONS ====================
  public async scheduleAppealNotifications() {
    const cron = (await import('node-cron')).default;

    cron.schedule('0 0 * * *', async () => {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      const pendingBlocks = await Blocklist.findAll({
        where: { block_date: threeDaysFromNow, appeal_status: 'pending' },
        include: [User]
      });

      for (const block of pendingBlocks) {
        await NotificationService.sendWarningNotification(
          block.user_id,
          'BLOCK_APPEAL_REMINDER',
          'BLOCK_APPEAL_REMINDER',
          `Your temporary block is scheduled in 3 days. Please submit an appeal if necessary.`
        );
        console.log(`⏰ Reminder notification sent to user ${block.user_id}`);
      }
    });
  }
  // ==================== NOTIFICATION METHODS ====================
  private isUserActionTarget(user: User, action_taken: ResolutionAction): boolean {
    return action_taken?.target_user_id === user.id;
  }
private async safeSendResolutionNotifications(
    caseId: string, 
    report: FraudCase, 
    action_taken: ResolutionAction | null, 
    transaction: any
): Promise<void> {
    try {
        console.log(`📧 Sending resolution notifications for case ${caseId}`);

        const involvedParties = await this.getInvolvedParties(report, transaction);
        const caseNumber = `CASE-${caseId.slice(-8).toUpperCase()}`;

        for (const user of involvedParties) {
            const isReporter = user.id === report.reporter_id;
            const isTarget = action_taken?.target_user_id === user.id;

            try {
                if (isTarget && action_taken?.type === 'warning') {
                    // Send warning notification
                    await NotificationService.sendWarningNotification(
                        user.id,
                        caseId,
                        caseNumber,
                        action_taken.message || 'A warning has been issued regarding your involvement in this case.'
                    );
                    console.log(`✅ Warning notification sent to user ${user.id}`);
                } else {
                    // Send fraud case resolution notification
                    await NotificationService.sendFraudCaseResolution(
                        user.id,
                        caseId,
                        caseNumber,
                        report.status,
                        action_taken?.type || 'resolved',
                        isReporter
                    );
                    console.log(`Resolution notification sent to user ${user.id}`);
                }
            } catch (error) {
                console.error(`Failed to send notification to user ${user.id}:`, error);
            }
        }

        console.log(`All notifications processed for case ${caseId}`);
    } catch (error) {
        console.error(`Error in sending notifications for case ${caseId}:`, error);
    }
}


  private async notifyCaseReopened(caseId: string, fraudCase: FraudCase, transaction: any): Promise<void> {
    try {
      const involvedParties = await this.getInvolvedParties(fraudCase, transaction);
      const caseNumber = `CASE-${caseId.slice(-8).toUpperCase()}`;
      
      for (const user of involvedParties) {
        await NotificationService.sendFraudCaseResolution(
          user.id,
          caseId,
          caseNumber,
          'reopened',
          'reopened',
          user.id === fraudCase.reporter_id
        );
      }
    } catch (error) {
      console.error('Error notifying about case reopening:', error);
    }
  }

  // ==================== INVOLVED PARTIES ====================
  private async getInvolvedParties(fraudCase: FraudCase, transaction?: any): Promise<User[]> {
    const parties: User[] = [];
    
    try {
      const options = transaction ? { transaction } : {};

      // Add reporter
      if (fraudCase.reporter_id) {
        const reporter = await User.findByPk(fraudCase.reporter_id, options);
        if (reporter) parties.push(reporter);
      }

      // Add volunteer through task
      if (fraudCase.task_id) {
        const task = await Task.findByPk(fraudCase.task_id, {
          ...options
        });
        if (task?.assigned_volunteer_id) {
          const volunteerUser = await User.findByPk(task.assigned_volunteer_id, options);
          if (volunteerUser) {
            parties.push(volunteerUser);
          }
        }
      }

      // Add donor through claim and food listing
      if (fraudCase.claim_id) {
        const claim = await Claim.findByPk(fraudCase.claim_id, {
          include: [{
            model: FoodListing,
            include: [{ model: Donor, include: [User] }]
          }],
          ...options
        });
        if (claim?.food_listing?.donor?.user) {
          parties.push(claim.food_listing.donor.user);
        }
      }

      // Remove duplicates
      const uniqueParties = parties.filter((party, index, self) => 
        index === self.findIndex(p => p.id === party.id)
      );

      return uniqueParties;
    } catch (error) {
      console.error('Error getting involved parties:', error);
      return parties;
    }
  }

  // ==================== ANALYTICS & ESCALATION ====================
  private async escalateCaseIfNeeded(fraudCase: FraudCase, transaction: any): Promise<void> {
    if (fraudCase.severity_level === 'high') {
      const admins = await User.findAll({ 
        where: { user_type: 'admin' },
        transaction 
      });
      
      for (const admin of admins) {
        await Notification.create({
          user_id: admin.id,
          title: 'High Severity Fraud Case Requires Attention',
          message: `Case ${fraudCase.id} has been marked as high severity and requires admin review.`,
          notification_type: NOTIF_TYPE.ALERT,
          related_entity_type: 'fraud_case',
          related_entity_id: fraudCase.id,
          is_read: false
        }, { transaction });
      }
      
      console.log(`🚨 High severity case ${fraudCase.id} escalated to admins`);
    }
  }

  private async logResolutionAnalytics(fraudCase: FraudCase, action: ResolutionAction, transaction: any): Promise<void> {
  
    const durationOpen = Math.floor((new Date().getTime() - fraudCase.date_reported.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📊 Resolution Analytics:', {
      case_id: fraudCase.id,
      resolution_type: action?.type || 'resolve',
      severity: fraudCase.severity_level,
      duration_open: durationOpen,
      evidence_count: fraudCase.evidence_files.length,
      action_taken: action?.type,
      target_user_type: action?.target_role
    });
  }

  // ==================== FRAUD ANALYTICS ====================
  private async getFraudAnalytics(): Promise<any> {
    try {
      const totalCases = await FraudCase.count();
      const openCases = await FraudCase.count({ where: { status: 'open' } });
      const highSeverityCases = await FraudCase.count({ where: { severity_level: 'high' } });
      
      return {
        totalCases,
        openCases,
        highSeverityCases,
        resolutionRate: totalCases > 0 ? ((totalCases - openCases) / totalCases * 100).toFixed(1) : '0'
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      return {
        totalCases: 0,
        openCases: 0,
        highSeverityCases: 0,
        resolutionRate: '0'
      };
    }
  }

  // ==================== SUGGESTION ENGINES ====================
  private suggestActionBasedOnSeverity(severity: string, evidenceCount: number): { type: string; points?: number; duration?: number } {
    const suggestions: { [key: string]: { type: string; points?: number; duration?: number } } = {
      'low': { type: 'warning' },
      'medium': { type: 'penalty', points: 5 },
      'high': { type: 'block', duration: 30 }
    };

    const baseSuggestion = suggestions[severity] || { type: 'warning' };
    
    if (evidenceCount >= 3 && severity === 'high') {
      return { ...baseSuggestion, duration: 60 };
    }
    
    if (evidenceCount === 0 && severity === 'high') {
      return { type: 'warning' };
    }

    return baseSuggestion;
  }

  private suggestFollowUpActions(action: ResolutionAction): string[] {
    const suggestions: { [key: string]: string[] } = {
      'warning': ['Monitor user activity for 30 days', 'Follow up in 2 weeks'],
      'penalty': ['Review user standing in 15 days', 'Check for previous violations'],
      'block': ['Schedule unblock review date', 'Document reason for future reference'],
      'dismiss': ['Analyze reporter pattern for false reports'],
      'resolve': ['Case completed successfully']
    };

    return suggestions[action?.type || 'resolve'] || ['Case processing complete'];
  }


  
public async debugDatabaseState(req: Request, res: Response) {
  try {
    console.log('🔍 Debugging database state...');
    
    
    const tableInfo = await FraudCase.sequelize!.getQueryInterface().describeTable('fraud_cases');
    console.log('Table columns:', Object.keys(tableInfo));
    
    const count = await FraudCase.count();
    console.log('Total records:', count);
    
    // Test 3: Try raw SQL
    const rawResult = await FraudCase.sequelize!.query(
      'SELECT id, status, date_reopened FROM fraud_cases LIMIT 1'
    );
    console.log('Raw SQL result:', rawResult[0]);
    
    res.json({
      status: 'success',
      tableColumns: Object.keys(tableInfo),
      recordCount: count,
      sampleData: rawResult[0]
    });
    
  } catch (error: any) {
    console.error('Debug failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message,
      sql: error.sql
    });
  }
}

  public async submitAppeal(req: Request, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      console.log("📝 Submitting appeal...");

      const { caseId, reason } = req.body;
      const userId = req.body.user_id || req.user?.id; 

      if (!caseId || !reason || !userId) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 400, "Missing required fields: caseId, reason, user_id");
      }

      // Validate user exists
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "User not found");
      }

      // Validate block exists
      const block = await Blocklist.findByPk(caseId, { transaction });
      if (!block) {
        await transaction.rollback();
        return responseUtils.sendErrorResponse(res, 404, "Block not found");
      }

      // Process uploaded evidence files
      let evidenceFiles: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
          const filePath = path.join(process.cwd(), "uploads", file.filename);
          if (fs.existsSync(filePath)) {
            evidenceFiles.push(file.filename);
          }
        }
      }

      // Create appeal entry
      const appeal = await Appeal.create(
        {
          user_id: userId,
          block_id: caseId,
          appeal_reason: reason,
          evidence_files: evidenceFiles,
          submission_date: new Date(),
          status: "pending",
        },
        { transaction }
      );

      await transaction.commit();

      console.log("✅ Appeal submitted successfully:", appeal.id);
      return responseUtils.sendSuccessResponse(
        res,
        201,
        {
          appealId: appeal.id,
          filesProcessed: evidenceFiles.length,
        },
        "Appeal submitted successfully"
      );
    } catch (error: any) {
      await transaction.rollback();
      console.error("❌ Error submitting appeal:", error.message);
      return responseUtils.sendErrorResponse(res, 500, "Could not submit appeal", error);
    }
  }
public async getAppeals(req: Request, res: Response) {
 console.log("Admin fetching all submitted appeals");

    
 
  try {
    console.log("Admin fetching all submitted appeals");

    const appeals = await Appeal.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ["id", "name", "email", "phone", "user_type"]
        },
        {
          model: Blocklist,
          as: 'block'
        }
      ],
      order: [["submission_date", "DESC"]]
    });

    console.log(`Found ${appeals.length} appeals`);

    return responseUtils.sendSuccessResponse(res, 200, {
      appeals: appeals.map(a => ({
        id: a.id,
        user_id: a.user_id,
        block_id: a.block_id,
        appeal_reason: a.appeal_reason,
        evidence_files: a.evidence_files,
        submission_date: a.submission_date,
        status: a.status
      }))
    }, "All submitted appeals fetched successfully for admin");

  } catch (error: any) {
    console.error("Error fetching appeals:", error);
    return responseUtils.sendErrorResponse(res, 500, "Failed to fetch appeals", error);
  }
}

public async getAppealById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const appeal = await Appeal.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ["id", "name", "email", "phone", "user_type"] 
        },
        { 
          model: Blocklist,
          as: 'block',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ["id", "name", "email", "user_type"]
            }
          ]
        }
      ]
    });

    if (!appeal) {
      return responseUtils.sendErrorResponse(res, 404, "Appeal not found");
    }

    const appealData = appeal.toJSON();

    // Get associated fraud case
    if (appealData.blocklist?.user_id) {
      const fraudCase = await FraudCase.findOne({
        where: {
          [Op.or]: [
            { reporter_id: appealData.blocklist.user_id },
            { '$task.assigned_volunteer_id$': appealData.blocklist.user_id }
          ]
        },
        include: [
          { model: User, as: 'reporter' },
          { model: Task, as: 'task' },
          { model: Claim, as: 'claim' }
        ],
        order: [['created_at', 'DESC']],
        limit: 1
      });

      if (fraudCase) {
        appealData.fraud_case = {
          id: fraudCase.id,
          case_number: `CASE-${fraudCase.id.slice(-8).toUpperCase()}`,
          description: fraudCase.description,
          issue_type: fraudCase.issue_type,
          severity_level: fraudCase.severity_level,
          status: fraudCase.status,
          date_reported: fraudCase.date_reported,
          resolution_details: fraudCase.resolution_details
        };
      }
    }

    return responseUtils.sendSuccessResponse(res, 200, appealData, "Appeal fetched successfully");

  } catch (error) {
    console.error("Error fetching appeal:", error);
    return responseUtils.sendErrorResponse(res, 500, "Failed to fetch appeal", error);
  }
}
public async decideAppeal(req: Request, res: Response) {
  const transaction = await Appeal.sequelize!.transaction();

  try {
    const { id } = req.params;
    const { decision, decision_notes, admin_id } = req.body;

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      await transaction.rollback();
      return responseUtils.sendErrorResponse(res, 400, "Invalid decision. Must be 'approved' or 'rejected'");
    }

    const appeal = await Appeal.findByPk(id, { 
      include: [
        { model: Blocklist, as: 'block' },  // CHANGED
        { model: User, as: 'user' }
      ],
      transaction 
    });

    if (!appeal) {
      await transaction.rollback();
      return responseUtils.sendErrorResponse(res, 404, "Appeal not found");
    }

    appeal.status = decision;
    appeal.decision_date = new Date();
    appeal.decision_notes = decision_notes || `Appeal ${decision}`;
    appeal.admin_reviewer_id = admin_id || 'system';
    await appeal.save({ transaction });

    if (decision === "approved") {
      const block = await Blocklist.findByPk(appeal.block_id, { transaction });
      if (block) {
        block.is_active = false;
        await block.save({ transaction });

        await NotificationService.sendFraudCaseResolution(
          appeal.user_id,
          appeal.id,
          `APPEAL-${appeal.id.slice(-8).toUpperCase()}`,
          'approved',
          'appeal_approved',
          false
        );

        console.log(`✅ User ${appeal.user_id} unblocked due to approved appeal`);
      }
    } else {
      await NotificationService.sendFraudCaseResolution(
        appeal.user_id,
        appeal.id,
        `APPEAL-${appeal.id.slice(-8).toUpperCase()}`,
        'rejected',
        'appeal_rejected',
        false
      );
    }

    await transaction.commit();

    return responseUtils.sendSuccessResponse(res, 200, appeal, `Appeal ${decision} successfully`);

  } catch (err: any) {
    await transaction.rollback();
    console.error("Error deciding appeal:", err);
    return responseUtils.sendErrorResponse(res, 500, "Failed to process appeal decision", err);
  }
}

}

export default new FraudCaseHandler();



