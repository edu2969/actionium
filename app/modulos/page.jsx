import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import HomeNeo from "./homeneo/page";

export default async function Modulos({ children }) {
    const session = await getServerSession(authOptions);
    return (
        <>
            <HomeNeo></HomeNeo>
        </>
    );
}