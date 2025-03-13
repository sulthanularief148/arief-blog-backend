import { addSubscriber } from "../models/subscriberModel.js";

const subscribeUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await addSubscriber(email);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default subscribeUser;
