import { Product, User } from "./models";
import { connectToDB } from "./utils";

export const fetchUsers = async (q, page) => {
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 3;

  try {
    connectToDB();
    const count = await User.countDocuments({ name: { $regex: regex } });
    const users = await User.find({ name: { $regex: regex } })
      .limit(ITEM_PER_PAGE)
      .skip(ITEM_PER_PAGE * (page - 1));

    return { count, users };
  } catch (err) {
    console.log(err);
    throw new Error("Gagal untuk mendapatkan data user !");
  }
};

export const fetchProducts = async (q, page) => {
  const regex = new RegExp(q, "i");

  const ITEM_PER_PAGE = 3;

  try {
    connectToDB();
    const count = await Product.countDocuments({ name: { $regex: regex } });
    const product = await Product.find({ name: { $regex: regex } })
      .limit(ITEM_PER_PAGE)
      .skip(ITEM_PER_PAGE * (page - 1));

    return { count, product };
  } catch (err) {
    console.log(err);
    throw new Error("Gagal untuk mendapatkan data barang !");
  }
};
