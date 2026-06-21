import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import intelligenceRouter from "./intelligence.js";
import voiceRouter from "./voice.js";
import pastoralistsRouter from "./pastoralists.js";
import chatRouter from "./chat.js";
import callTokensRouter from "./callTokens.js";
import groundTruthRouter from "./groundTruth.js";
import publicTalkRouter from "./publicTalk.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(intelligenceRouter);
router.use(voiceRouter);
router.use(pastoralistsRouter);
router.use(chatRouter);
router.use(callTokensRouter);
router.use(groundTruthRouter);
router.use(publicTalkRouter);

export default router;
