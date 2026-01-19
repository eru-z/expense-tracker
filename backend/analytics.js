import { Router } from "express"
import { query } from "./db.js"
import { auth } from "./middleware.js"

export const analyticsRouter = Router()
analyticsRouter.use(auth)

analyticsRouter.get("/summary", async (req,res)=>{
  const income = (await query("select sum(amount) from transactions where user_id=$1 and type='income'",[req.user.id])).rows[0].sum || 0
  const expense = (await query("select sum(amount) from transactions where user_id=$1 and type='expense'",[req.user.id])).rows[0].sum || 0
  res.json({ income, expense, balance: income - expense })
})
