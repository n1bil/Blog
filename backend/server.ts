import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";
import userRoutes from "./src/router/userRouter";
import postRoutes from "./src/router/postRouter";
import commentRoutes from "./src/router/commentRouter";
import notificationRoutes from "./src/router/notificationRouter";



const server = express();
config();

const port = process.env.PORT;
server.use(morgan("dev"));
server.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.DATABASE_URL || '', {
    autoIndex: true
});


server.use("/", userRoutes);
server.use("/", postRoutes);
server.use("/", commentRoutes);
server.use("/", notificationRoutes);


server.listen(port, () => {
    console.log("Server running on port: " + port);
});

export default server;