import { Router, type IRouter } from "express";
import healthRouter from "./health";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import tagsRouter from "./tags";
import speciesRouter from "./species";
import portfolioRouter from "./portfolio";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";

const router: IRouter = Router();

router.use(healthRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(tagsRouter);
router.use(speciesRouter);
router.use(portfolioRouter);
router.use(contactRouter);
router.use(newsletterRouter);

export default router;
