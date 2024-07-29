import { config } from "dotenv";
import mongoose from "mongoose";
config();

export default async () => {
  try {
    // await mongoose.connect(`mongodb://127.0.0.1:27017/Facebook`, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true
    // });
    await mongoose.connect(
      `mongodb+srv://gitsagroup38:${process.env.MONGODbPassword}@cluster0.cn8bvev.mongodb.net/Leap?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.log("Error in Connection", error);
    return false;
  }
};
