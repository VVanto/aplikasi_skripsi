import NextAuth from "next-auth";
import { User } from "./lib/models";
import { connectToDB } from "./lib/utils";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { authConfig } from "./authconfig";

const login = async (credentials) => {
  try {
   connectToDB();
    const user = await User.findOne({ username: credentials.username });

    if (!user) throw new Error("Username atau password salah !");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Username atau password salah !");
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Gagal melakukan login !");
  }
};

export const { signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
});
