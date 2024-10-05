import User from "../model/User.model.js";
import jwt from "jsonwebtoken";
import { stripPassword } from "./Auth.controller.js";
import OpenAI from "openai";

export const setProfession = async (req, res) => {
    try {
        const { _id } = req.user;
        const { profession } = req.body;

        const user = await User.findByIdAndUpdate(_id, { profession }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        return res.status(200).json({ success: true, user: { token, ...stripPassword(user._doc) } });
    } catch (error) {
        console.error("Error setting profession:", error);
        return res.status(400).json({ message: "Error setting profession", error });
    }
}


export const openAI = async (req, res) => {
    try {
        const { _id } = req.user;
        const {prompt} = req.body;

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const message = `${prompt}`
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        res.status(200).json({
            message: response.choices[0].message,
            prompt: message,
        });
    } catch (error) {
        console.log("Error generating GPT respose", error);
        return res.status(400).json({
            message: "Internal Server Error",
        });
    }
};