import { createServer } from "http"
import express from "express"
import cors from 'cors'
import { configDotenv } from 'dotenv'
import connectDB from "./db/dbConnect.js"
import { Server } from "socket.io"
import messageRoute from "./routes/Message.route.js"
import Msg from "./models/message.js"
configDotenv()
connectDB()


const app = express();
app.use(cors({
    origin: ["https://beketikro-paglu.vercel.app", "http://localhost:3000"],
    credentials: true,
}));
app.use(express.json());

const httpServer = createServer(app)

const onlineUsers = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: ["https://beketikro-paglu.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true

    }
})

app.use("/api/msg", messageRoute(io))


io.on("connection", (socket) => {

    socket.on("join", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // JOIN ROOM FOR PRIVATE CHAT
    socket.on("join-room", ({ room }) => {
        socket.join(room);
    });

    socket.on("send-message", async ({ room, content, sender, reciver }) => {
        const msg = await Msg.create({ content, sender, reciver });

        io.to(room).emit("new-message", msg);
    });
    // online-status
      socket.on("join-user", (userId) => {
        socket.userId = userId;
        io.emit("user-online", userId);
        
    });

    

     socket.on("edit-message", async ({ room,msgId, newContent }) => {
        const updatedMsg = await Msg.findByIdAndUpdate(
            msgId,
            { content: newContent },
            { new: true }
        );
        
        io.to(room).emit("message-updated",updatedMsg)
       
    });

   // DELETE MESSAGE
    socket.on("delete-message", async ({room,msgId }) => {
        const deletedMsg = await Msg.findByIdAndUpdate(
            msgId,
            { isDelete: true },
            { new: true }
        );
        io.to(room).emit("message-deleted",deletedMsg)
       
    });

    // TYPING INDICATOR
    socket.on("typing", ({ room, sender }) => {
        socket.to(room).emit("typing", sender);
    });

    socket.on("stop-typing", ({ room, sender }) => {
        socket.to(room).emit("stop-typing", sender);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        for (const [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                io.emit("user-offline",userId)
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("online-users", Array.from(onlineUsers.keys()));
    });
})


app.get("/", (req, res) => {
    res.send("this is the home page")
})

httpServer.listen(process.env.PORT||4000, () =>
    console.log("Server running on http://localhost:4000")
);

