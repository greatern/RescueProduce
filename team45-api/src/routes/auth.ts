import { Request, Response, Router } from "express";
import { login } from "../handlers/auth";
import { registerUser } from "../handlers/users";

const router = Router();

router.post("/login", login);
router.post("/register", registerUser);

export default router;
