import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import USER_ROLE from "../../../utils/constants";

export async function GET() {
    try {
        console.log("InitTeam...");
        await connectMongoDB();
        const users = await User.find({ "role": { $gt: USER_ROLE.toolManager } });
        if (users.length == 0) {
            const team = [{ name: "Roberto Ulloa", role: USER_ROLE.hidraulicMechanical },
            { name: "Gioanni Perez Pino", role: USER_ROLE.electrician },
            { name: "Juan Gonzalez", role: USER_ROLE.cap },
            { name: "NUEVA HERRAMIENTA", role: USER_ROLE.quant_cl07 },
            { name: "Jorge Venrgara", role: USER_ROLE.cap },
            { name: "Cristian Borquez", role: USER_ROLE.cap },
            { name: "Deny Rodriguez", role: USER_ROLE.quant_cl07 },
            { name: "Ariel Allendes Fernandez", role: USER_ROLE.electrician },
            { name: "Fredy Pedrero", role: USER_ROLE.welder },
            { name: "Alejando Jara", role: USER_ROLE.coladaOverseer },
            { name: "Juan Avila", role: USER_ROLE.upp },
            ]
            for(var i = 0; i < team.length; i++) {
                const email = team[i].name.replaceAll(" ", "").toLocaleLowerCase() + "@yopmail.com";
                await User.create({
                    name: team[i].name,
                    email,
                    password: "$2a$10$ay5PfXLdMNVNZJ5x2E5z8.aTFydbUGcvmRSvGDBDporVhy3qUrahq",
                    createdAt: new Date(),
                    role: team[i].role,
                    avatarImg: "",
                })
            }
            console.log(team.length, "x useres created");
        }        
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.log(error);
    }
}
