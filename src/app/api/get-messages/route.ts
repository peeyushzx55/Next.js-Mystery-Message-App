import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import User from "@/models/user.models";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    // First check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // If user exists but has no messages, return empty array
    if (!userExists.messages || userExists.messages.length === 0) {
      return Response.json({ messages: [] }, { status: 200 });
    }

    // If user has messages, get them sorted
    const user = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec();

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
