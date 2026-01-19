import { Router } from "express";
import { getHome } from "../controllers/home.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", auth, getHome);

export default router;
