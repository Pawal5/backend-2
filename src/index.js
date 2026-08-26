//import dotenv from "dotenv";
import app from "./app.js";
import connect from "./db/index.js";

//dotenv.config({
  //  path: "./.env"
//});

const PORT = process.env.PORT || 8000;

connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });