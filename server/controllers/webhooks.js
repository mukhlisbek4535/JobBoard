import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret.
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Check if the request is a valid Clerk webhook %%%%%%%%%%%%%%%%%
    // Verify and parse payload
    const payloadString = req.body.toString("utf8");

    // Verifying Headers
    const payload = await whook.verify(payloadString, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    console.log("✅ Clerk Webhook verified successfully");

    // Getting Data from request body
    const { data, type } = payload;
    console.log("Incoming Clerk event", type);
    console.log("Event data:", data);
    // Switch Cases for differernt Events
    switch (type) {
      case "user.created": {
        console.log("logging the type in the case: ", type);
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          image: data.image_url,
          resume: "",
        };
        try {
          const user = await User.findOneAndUpdate(
            { email: userData.email }, // search by email
            userData, // update with new data
            { upsert: true, new: true } // create if not exists
          );
          console.log("✅ User saved/updated in DB:", user);
          res.status(200).json({ success: true });

          //   please.....................
          //   const createdUser = await User.create(userData);
          //   console.log("✅ User saved to DB:", createdUser);
          //   res.status(200).json({ success: true });
        } catch (err) {
          console.error("❌ Error saving user:", err);
          res.status(500).json({ success: false, error: err.message });
        }
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          image: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default: {
        console.log(`🔔 Unhandled Clerk event type: ${type}`);
        return res.json({ received: true, type });
      }
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
