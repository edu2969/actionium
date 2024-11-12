import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("getAll...");
    await connectMongoDB();
    const users = await User.find();
    return NextResponse.json({ users });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req) {
  try {
      await connectMongoDB();
      const params = await req.json();
      console.log("Users POST...", params);
      const exists = await User.findOne(params._id ? { _id: params.id } : { email: params.email });
      if (exists) {
        console.log("BODY UPDATE", exists._id , body);
          const user = await User.findByIdAndUpdate(exists._id, body, {
              new: true
          });
          return user ? NextResponse.json(user) : NextResponse.json("NOT UPDATED", {
              status: 404,
          });
      }
      return NextResponse.json({
          ok: true,
          id: await User.create(params)
      });
  } catch (error) {
      console.log("ERROR!", error);
      return NextResponse.json(error.message, {
          status: 404,
      })
  }
}