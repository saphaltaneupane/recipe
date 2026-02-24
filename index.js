import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDb from "./dbconnection.js";
import { Usercontroller } from "./user/user.controller.js";
import { RecipeController } from "./recepie/recepie.controller.js";

const app = express();

app.use(express.json());

await connectDb();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // allowed frontends
    credentials: true, // allows cookies and auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
  }),
);

app.use(Usercontroller);
app.use(RecipeController);

app.use(express.json());
const Port = 8000;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
