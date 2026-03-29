import { Router } from "express"
import { generateReply } from "../controllers/generateController"

const router = Router()

router.post("/", generateReply)

export default router
