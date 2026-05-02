import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import portfolioRouter from "./portfolio";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(articlesRouter);
router.use(portfolioRouter);
router.use(contactRouter);
router.use(newsletterRouter);

export default router;
