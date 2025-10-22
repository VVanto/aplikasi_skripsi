import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
      min: 3,
      max: 20,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    password: {
      type: String,
      required: true,
      unique: false,
      min: 8,
      max: 12,
    },
    role: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
      min: 3,
      max: 20,
    },
    kate: {
      type: String,
      required: true,
      unique: false,
      min: 3,
      max: 20,
    },
    stok: {
      type: Number,
      required: true,
      unique: false,
      min: 0,
      max: 1000000,
    },
    satuan: {
      type: String,
      required: true,
      unique: false,
      min: 0,
      max: 20,
    },
    harga: {
      type: Number,
      required: true,
      unique: false,
      min: 0,
      max: 100000000,
    },
    deskrip: {
      type: String,
      required: false,
      unique: false,
      min: 0,
      max: 256,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
