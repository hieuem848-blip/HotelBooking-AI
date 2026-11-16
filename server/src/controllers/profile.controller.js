import Hotel from "../models/Hotel.js";

export const stats = async (req, res) => {
  const filter = req.user.role === "ADMIN" ? {} : { ownerId: req.user._id };
  const hotels = await Hotel.countDocuments(filter);

  res.json({ success: true, data: { hotels } });
};
