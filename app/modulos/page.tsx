import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import HomeNeo from "./homeneo/page";

export default async function Modulos() {
    const session = await getServerSession(authOptions);
    return (
        <>
            <HomeNeo />
        </>
    );
}