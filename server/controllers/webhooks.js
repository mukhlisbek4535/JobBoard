import { Webhook } from "svix";
import User from "../models/User.js";

// Shared function to create or update user
async function upsertUser(data) {
  const userDoc = {
    _id: data.id,
    email: data.email_addresses[0].email_address,
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
    image: data.image_url,
    resume: "",
  };

  const existingUser = await User.findOne({
    $or: [{ _id: data.id }, { email: userDoc.email }],
  });

  if (existingUser) {
    // Merge changes into existing user
    existingUser.name = userDoc.name;
    existingUser.image = userDoc.image;
    existingUser.resume = existingUser.resume || "";
    existingUser.email = userDoc.email; // Update email if it has changed
    // Object.assign(existingUser, { ...userDoc, _id: existingUser._id });
    return await existingUser.save();
  } else {
    return await User.create(userDoc);
  }
  // upsert: true = create if not found
  //   const updatedUser = await User.findByIdAndUpdate(data.id, userDoc, {
  //     new: true,
  //     upsert: true,
  //     setDefaultsOnInsert: true,
  //   });

  //   return updatedUser;
}

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
      case "user.created":
      case "user.updated": {
        console.log("logging the type in the case: ", type);

        try {
          const user = await upsertUser(data);
          console.log(`✅ User upserted and event type: ${type}, user-`, user);
          res.status(200).json({ success: true, user });
          //   const existingUser = await User.findOne({
          //     email: data.email_addresses[0].email_address,
          //   });
          //   if (existingUser) {
          //     // update only allowed fields
          //     existingUser.name = data.first_name + " " + data.last_name;
          //     existingUser.image = data.image_url;
          //     existingUser.resume = existingUser.resume || "";
          //     await existingUser.save();
          //     console.log("✅ User updated in DB:", existingUser);
          //     res.status(200).json({ success: true });
          //   } else {
          //     // create new user with _id from Clerk
          //     const createdUser = await User.create({
          //       _id: data.id,
          //       email: data.email_addresses[0].email_address,
          //       name: data.first_name + " " + data.last_name,
          //       image: data.image_url,
          //       resume: "",
          //     });
          //     console.log("✅ New user saved to DB:", createdUser);
          //     res.status(200).json({ success: true });
          //   }
          //   please.....................
          //   const createdUser = await User.create(userData);
          //   console.log("✅ User saved to DB:", createdUser);
          //   res.status(200).json({ success: true });
        } catch (err) {
          console.error(`error processing ${type}. ❌ Error saving user:`, err);
          res.status(500).json({ success: false, error: err.message });
        }
        break;
      }

      //   case "user.updated": {
      //     const userData = {
      //       email: data.email_addresses[0].email_address,
      //       name: data.first_name + " " + data.last_name,
      //       image: data.image_url,
      //     };
      //     await User.findByIdAndUpdate(data.id, userData);
      //     res.json({});
      //     break;
      //   }

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
