"use server";

import { revalidatePath } from "next/cache";
import { Product, User } from "./models/userModel";
import { connectToDB } from "./utils";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { signIn } from "../auth";


export const addUser = async (formData) => {
  const { name, username, password, role } = Object.fromEntries(formData);

  try {
    connectToDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      role,
    });
    await newUser.save();
  } catch (err) {
    console.log(err);
    throw new Error("Gagal membuat pengguna");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();

    await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Gagal menghapus pengguna");
  }

  revalidatePath("/dashboard/products");
};

export const updateUser = async (formData) => {
  const { id, name, username, password, role } = Object.fromEntries(formData);

  try {
    connectToDB();

    const updateFields = {
      name,
      username,
      password,
      role,
    };

    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await User.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Gagal memperbarui data pengguna");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

export const addProduct = async (formData) => {
  const { name, kate, stok, satuan, harga, deskrip } =
    Object.fromEntries(formData);

  try {
    connectToDB();

    const newProduct = new Product({
      name,
      kate,
      stok,
      satuan,
      harga,
      deskrip,
    });
    await newProduct.save();
  } catch (err) {
    console.log(err);
    throw new Error("Gagal menambahkan produk");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
};

export const deleteProduct = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();

    await Product.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Gagal menghapus produk");
  }

  revalidatePath("/dashboard/products");
};

export const updateProduct = async (formData) => {
  const { id, name, kate, stok, harga, deskrip } = Object.fromEntries(formData);

  try {
    connectToDB();

    const updateFields = {
      name,
      harga,
      stok,
      kate,
      deskrip,
    };

    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await Product.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Gagal memperbarui produk");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
};

export const authenticate = async (formData) => {
  const { username, password } = Object.fromEntries(formData);

  try {
    await signIn("credentials", { username, password });
  } catch (err) {
    console.log(err);
    throw err;
  }
};
