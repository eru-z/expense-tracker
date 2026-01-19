console.log("AUTH MIDDLEWARE JWT_SECRET =", process.env.JWT_SECRET);

import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "dev-access-secret";

export default function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, ACCESS_SECRET);

    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.log("JWT VERIFY FAILED");
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
