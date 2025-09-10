import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import User from "@/models/User";
import { generateToken } from "@/utils/jwt";
import mongoose from "mongoose";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI!);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    await connectDB();

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.name) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        role: "User",
      });
    }

    const jwtToken = generateToken(user._id.toString());
    return NextResponse.json({ token: jwtToken, user });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
