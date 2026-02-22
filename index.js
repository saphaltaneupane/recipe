import express from "express";
import mongoose from "mongoose";
import connectDb from "./dbconnection.js";
import { Usercontroller } from "./user/user.controller.js";

const app = express();

app.use(express.json());

await connectDb();

app.use(Usercontroller);

app.use(express.json());
const Port = 8000;

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
