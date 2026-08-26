import mongoose from "mongoose";
import { DB } from "../cons.js";

const connect = async () => {
    try {
        const app = await mongoose.connect(
            `${process.env.MONGODB_URL}/${DB}`
        );

        console.log(`MongoDB connected: ${app.connection.host}`);
    } catch (err) {
        console.log("MongoDB connection error:", err);
        process.exit(1);
    }
};

export default connect;