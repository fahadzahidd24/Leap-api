import Event from "../model/event.model.js";
import User from "../model/User.model.js";

// Create a new success formula and sales target
export const createEvent = async (req, res) => {
  const { title, description, startTime, endTime, status } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime,
      status,
      userId: req.user._id,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating entries:", error);
    res.status(500).json({ message: "Error creating event", error });
  }
};

export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching entries:", error);

    res.status(400).json({ message: "Error fetching events", error });
  }
};

export const getUserEventsByIds = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.params.userId });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching entries:", error);

    res.status(400).json({ message: "Error fetching events", error });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const companyName = req.user.companyName;

    // Find all users with the same companyName (case-insensitive)
    const users = await User.find({
      companyName: { $regex: new RegExp(`^${companyName}$`, "i") },
    }).select("_id");

    // Extract userIds from the users
    const userIds = users.map((user) => user._id);

    // Find all events belonging to the users with the same companyName
    const events = await Event.find({ userId: { $in: userIds } });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(400).json({ message: "Error fetching events", error });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, startTime, endTime, status } = req.body;

  try {
    const event = await Event.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, description, startTime, endTime, status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error updating entries:", error);

    res.status(400).json({ message: "Error updating event", error });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting entries:", error);

    res.status(400).json({ message: "Error deleting event", error });
  }
};
