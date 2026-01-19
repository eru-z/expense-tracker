import { Router } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "./db.js"
import { config } from "./config.js"

export const authRouter = Router()

authRouter.post("/register", async (req,res)=>{
  try{
    const { name,email,password } = req.body
    const hash = await bcrypt.hash(password,10)
    const user = await pool.query(
      "insert into users(name,email,password_hash) values($1,$2,$3) returning id,email",
      [name,email,hash]
    )
    const token = jwt.sign({ id:user.rows[0].id }, config.JWT_SECRET)
    res.json({ token })
  }catch(e){
    if(e.code==="23505") return res.status(400).json({ error:"Email already registered" })
    res.status(500).json({ error:"Server error" })
  }
})

authRouter.post("/login", async (req,res)=>{
  const { email,password } = req.body
  const user = await pool.query("select * from users where email=$1",[email])
  if(!user.rows.length) return res.status(401).json({ error:"Invalid credentials" })
  const ok = await bcrypt.compare(password,user.rows[0].password_hash)
  if(!ok) return res.status(401).json({ error:"Invalid credentials" })
  const token = jwt.sign({ id:user.rows[0].id }, config.JWT_SECRET)
  res.json({ token })
})
