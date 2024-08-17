import Chat from "../model/chat.model.js";

export const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Generate chatId from the two user IDs
    const chatId = [userId1, userId2].sort().join("-");

    // Find the chat by chatId
    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getInbox = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find chats where the current user is a participant
    const chats = await Chat.find({
      participants: userId,
    })
      .sort({ "lastMessage.timestamp": -1 })
      .select("participants lastMessage")
      .populate({
        path: "participants",
        select: "fullName",
      });

    // Format the response to include the other user and last message details
    const inbox = chats.map((chat) => {
      const otherUser = chat.participants.find(
        (participant) => participant._id.toString() != userId.toString()
      );

      // console.log(otherUser);

      return {
        otherUserId: otherUser._id,
        otherUserName: otherUser.fullName,
        lastMessage: chat.lastMessage.content,
        timestamp: chat.lastMessage.timestamp,
      };
    });

    res.status(200).json(inbox);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
};
