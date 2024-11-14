import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import HomeNeo from "./homeneo/page";

interface ModulosProps {
    children: ReactNode;
}

export async function Modulos({ children }: ModulosProps): Promise<JSX.Element> {
    const session = await getServerSession(authOptions);
    return (
        <>
            <HomeNeo />
            {children}
        </>
    );
}