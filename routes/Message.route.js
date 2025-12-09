import express from "express";
import Msg from "../models/message.js";

export default function messageRoute(io) {
    const router = express.Router();
    
    // Get messages
    router.get("/:u1/:u2", async (req, res) => {
        try {
            const { u1, u2 } = req.params;

            // Pagination params
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;

            // How many messages to skip
            const skip = (page - 1) * limit;

            // Fetch messages newest → oldest
            const msgs = await Msg.find({
                $or: [
                    { sender: u1, reciver: u2 },
                    { sender: u2, reciver: u1 }
                ]
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
                const finalMsgs = msgs.reverse();

            res.json({ success: true, data: finalMsgs });
        } catch (e) {
            res.status(500).json({ success: false, message: "Error", e });
        }
    });


    return router;
}
