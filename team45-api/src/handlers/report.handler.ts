import { Request, Response } from "express";
import { Report } from "../models/report";
import { User } from "../models/user";
import { Admin } from "../models/admin";
import { responseUtils } from "../utils/response";
import { FoodListing } from "../models/food_listing";

class ReportHandler {
  async createReport(req: Request, res: Response) {
    try {
      const { reporter_id, reported_id, donation_id, report_type, description } = req.body;

      const report = await Report.create({
        reporter_id,
        reported_id,
        donation_id,
        report_type,
        description,
        status: "open",
      });

      return responseUtils.sendSuccessResponse(res, 201, report, "Report created successfully");
    } catch (error) {
      console.error("Error creating report:", error);
      return responseUtils.sendErrorResponse(res, 500, "Error creating report", error);
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const reports = await Report.findAll({
        include: [
          { model: FoodListing, include: [{ model: User, as: "donor" }, { model: User, as: "volunteer" }] },
          { model: User, as: "reporter" },
          { model: User, as: "reported" },
          { model: Admin, as: "admin" },
        ],
        order: [["created_at", "DESC"]],
      });

      return responseUtils.sendSuccessResponse(res, 200, reports, "Reports fetched successfully");
    } catch (error) {
      console.error("Error fetching reports:", error);
      return responseUtils.sendErrorResponse(res, 500, "Error fetching reports", error);
    }
  }
}

export default new ReportHandler();

