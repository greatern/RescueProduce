import { NextFunction, Router, Request, Response } from "express";
import { login } from "../handlers/auth";
import {
	addAdress,
	getUserAddress,
	getUsers,
	getUserProfile,
	updateBackupStatus,
	registerPushToken,
	unregisterPushToken,
} from "../handlers/users";
import { validateBody } from "../validator/validateBody";
import { UserDto } from "../dtos/userDto";
import { AddressDto } from "../dtos/addressDto";
import { logMessage } from ".";

const router = Router();

router.get("/", getUsers);

// Profile routes - these are the ones causing the error
//router.put("/:user_id/profile", updateProfile); // Changed from updateUserProfile to updateProfile
router.get("/:user_id/profile", getUserProfile);

router.post("/address", validateBody(AddressDto), addAdress);

router.get("/address/:id", logMessage("Address"), getUserAddress);

router.post("/backup", updateBackupStatus);

router.post("/register_token", registerPushToken);

router.delete("/unregister_token/:user_id", unregisterPushToken);

export default router;
