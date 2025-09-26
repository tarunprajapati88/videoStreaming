import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js"; // <-- Use the app from app.js

connectDB().then(
    () => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server started on port ${process.env.PORT || 8000}`);
        });
        console.log("Connected to MongoDB");
    }
).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});