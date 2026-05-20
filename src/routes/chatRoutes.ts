import { Router } from "express";
import { handleChatMessage } from "../controllers/chatController";

const router = Router();// Create a new router instance

router.post('/message', handleChatMessage);

export default router;