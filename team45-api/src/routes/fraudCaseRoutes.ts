
import { Router } from "express";
import fraudCaseHandler from "../handlers/fraudCaseHandler";
import { upload } from "../middleware/upload"

const router = Router();

router.post("/", upload.array("evidence", 5), fraudCaseHandler.createReport);
router.get("/", fraudCaseHandler.getReports);
router.get("/:id", fraudCaseHandler.getReportById);
router.put("/:id/resolve", fraudCaseHandler.resolveReport);
router.put("/:id/reopen", fraudCaseHandler.reopenCase);

router.get("/debug/state", fraudCaseHandler.debugDatabaseState);


router.get("/appeals", fraudCaseHandler.getAppeals);
router.post("/appeals", upload.array("evidenceFiles"), fraudCaseHandler.submitAppeal); // REMOVED :caseId
router.get("/appeals/:id", fraudCaseHandler.getAppealById);
//router.post("/appeals/:id/review", fraudCaseHandler.reviewAppeal);
router.post("/appeals/:id/decision", fraudCaseHandler.decideAppeal);
export default router;
