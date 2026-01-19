import "dotenv/config";
import app from "./src/app.js";
import "./src/db.js";

const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API running on http://0.0.0.0:${PORT}`);
});
