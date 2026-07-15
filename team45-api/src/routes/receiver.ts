// src/routes/receiver.ts

import { Router } from "express";
import { validateBody } from "../validator/validateBody";
import { ReceiverDto } from "../dtos/receiverDto";
import ReceiverHandler from "../handlers/receiver"; //Import the default instance of the class
import MapHandler from "../handlers/maps";
import { claims } from "../handlers/foodlistings";
import { ClaimDto } from "../dtos/claimDto";

const router = Router();

// Use the imported default instance directly
const receiverHandlerInstance = ReceiverHandler; // Give it a clearer name for usage
const mapHandler = MapHandler;

router.get(
	"/:id/foodListings",
	receiverHandlerInstance.getFoodListings.bind(receiverHandlerInstance)
);

router.get("/closest-donations", mapHandler.getClosestDonations);

router.post(
	"/claim",
	validateBody(ClaimDto),
	receiverHandlerInstance.claim.bind(receiverHandlerInstance)
);

router.get("/claims/:id", claims);

router.get(
	"/tasks/:id",
	receiverHandlerInstance.getTasks.bind(receiverHandlerInstance)
);

router.post(
	"/pickup",
	receiverHandlerInstance.confirmPickup.bind(receiverHandlerInstance)
);

router.delete(
	"/task/:task_id/:receiver_id",
	receiverHandlerInstance.cancelTask.bind(receiverHandlerInstance)
);

router.get("/claims-history/:id", ReceiverHandler.getClaimHistory);
router.get(
  "/dashboard/:id",
  receiverHandlerInstance.getDashboard.bind(receiverHandlerInstance)
);


export default router;
