import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  modelUrl: {
    type: String,
    required: true
  }
});

export default mongoose.model("FoodItem", foodItemSchema);