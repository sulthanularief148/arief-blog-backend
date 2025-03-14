import { addSubscriber } from "../models/subscriberModel.js";
import { sendSubscriptionEmail } from "../utils/sendEmail.js";

const subscribeUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`📩 New Subscription Request: ${email}`);

    const result = await addSubscriber(email);
    if (!result.success) {
      console.log("❌ Subscription failed:", result.message);
      return res.status(400).json({ message: result.message });
    }

    console.log("✅ Subscription successful. Sending email...");

    // Call the function and log before and after
    await sendSubscriptionEmail(email);


    console.log("✅ Email function executed successfully");

    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error("❌ Subscription Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export default subscribeUser;
