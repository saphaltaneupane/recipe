import mongoose from "mongoose";

const connectDb = async () => {
  try {
    let url = `mongodb+srv://recepie:Recepie123@pramod.49wcu.mongodb.net/recepie?retryWrites=true&w=majority&appName=pramod`;
    await mongoose.connect(url);
    console.log({ message: " db connection successful..." });
  } catch (error) {
    console.log("db connection failed...");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDb;
