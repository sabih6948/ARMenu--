import "dotenv/config";
import mongoose from "mongoose";
import cloudinary from "./config/cloudinary.js";
import FoodItem from "./models/FoodItem.js";

// Your 11 existing items — same data as your original seed.js,
// pointing at the local files still sitting in public/models/
const items = [
  { name: "Burger", category: "Main", price: 500, localFile: "burger.glb" },
  { name: "Chicken", category: "Main", price: 550, localFile: "chicken.glb" },
  { name: "Chicken Duck", category: "Main", price: 600, localFile: "chicken_duck.glb" },
  { name: "Ice Drink", category: "Beverage", price: 200, localFile: "ice_drink.glb" },
  { name: "Noodles", category: "Main", price: 450, localFile: "noodles.glb" },
  { name: "Pizza", category: "Main", price: 700, localFile: "pizza.glb" },
  { name: "Platter", category: "Main", price: 900, localFile: "platter.glb" },
  { name: "Seafood", category: "Main", price: 850, localFile: "seafood.glb" },
  { name: "Steak and Rice", category: "Main", price: 750, localFile: "steak_and_rice_scaniverse.glb" },
  { name: "Steak Sandwich", category: "Main", price: 650, localFile: "steak_sandwich_scaniverse_lidar.glb" },
  { name: "Summer Drink", category: "Beverage", price: 250, localFile: "summer_drink.glb" }
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // Wipe old local-file-based entries before reseeding
  await FoodItem.deleteMany({});
  console.log("Cleared old items");

  for (const item of items) {
    console.log(`Uploading ${item.localFile}...`);

    const result = await cloudinary.uploader.upload(
      `./public/models/${item.localFile}`,
      {
        folder: "armenu-models",
        resource_type: "raw",
        public_id: item.localFile.replace(".glb", "")
      }
    );

    await FoodItem.create({
      name: item.name,
      category: item.category,
      price: item.price,
      modelUrl: result.secure_url
    });

    console.log(`  -> Done: ${result.secure_url}`);
  }

  console.log("All items migrated to Cloudinary!");
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});