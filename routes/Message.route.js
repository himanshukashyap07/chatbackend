import express from "express";
import Msg from "../models/message.js";

export default function messageRoute(io) {
    const router = express.Router();

    // Create message
    router.post("/", async (req, res) => {
        try {
            const { content, sender, reciver } = req.body;

            const msg = await Msg.create({ content, sender, reciver });

            // Emit socket event
            io.to(sender).emit("new-message", msg);
            io.to(reciver).emit("new-message", msg);

            res.status(201).json({ success: true, data: msg });
        } catch (e) {
            res.status(500).json({ success: false, message: "Error" });
        }
    });

    // Get messages
    router.get("/:u1/:u2", async (req, res) => {
        try {
            const { u1, u2 } = req.params;

            const msgs = await Msg.find({
                $or: [
                    { sender: u1, reciver: u2 },
                    { sender: u2, reciver: u1 }
                ]
            }).sort({ createdAt: 1 });

            res.json({ success: true, data: msgs });
        } catch (e) {
            res.status(500).json({ success: false,e, message: "Error" });
        }
    });

    // Update message
    router.put("/:msgId", async (req, res) => {
        try {
            const { msgId } = req.params;
            const { content } = req.body;

            const updatedMsg = await Msg.findByIdAndUpdate(
                msgId,
                { content },
                { new: true }
            );

            io.to(updatedMsg.sender.toString()).emit("message-updated", updatedMsg);
            io.to(updatedMsg.reciver.toString()).emit("message-updated", updatedMsg);

            res.json({ success: true, data: updatedMsg });
        } catch (e) {
            res.status(500).json({ success: false, message: "Error" });
        }
    });

    // Delete message
    router.delete("/:msgId", async (req, res) => {
        try {
            const { msgId } = req.params;

            const deletedMsg = await Msg.findByIdAndUpdate(
                msgId,
                { isDelete: true },
                { new: true }
            );

            io.to(deletedMsg.sender.toString()).emit("message-deleted", deletedMsg);
            io.to(deletedMsg.reciver.toString()).emit("message-deleted", deletedMsg);

            res.json({ success: true, data: deletedMsg });
        } catch (e) {
            res.status(500).json({ success: false, message: "Error" });
        }
    });

    return router;
}
