import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { USER_ROLE } from "../../../utils/constants";
import ToolStorage from "@/models/tool-storage";
import UserStorageItemSet from "@/models/user-storage-item-set"

export async function GET() {
    console.log("getTeam...");
    await connectMongoDB();    
    const users = await User.find({ role: { $gt: USER_ROLE.toolManager }}, { 
        _id: 1, 
        name: 1, 
        rut: 1, 
        birthDate: 1, 
        avatarImg: 1, 
        role: 1 });
    var team = [];
    const ts = await ToolStorage.findOne();    
    for(var i = 0; i < users.length; i++) {
        const set = await UserStorageItemSet.find({
            userId: users[i]._id,
            toolStorageId: ts._id,
            quantity: { $gt: 0 },
        });                
        team.push({
            _id: users[i]._id,
            name: users[i].name,
            rut: users[i].rut,
            birthDate: users[i].birthDate,
            avatarImg: users[i].avatarImg,
            role: users[i].role,
            hasSome: set.length > 0,
        });
    }
    return NextResponse.json({ users: team });
}
