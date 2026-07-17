import React, { ReactNode } from "react";
import HomeNeoPage from "./homeneo/page";
import HomePanel from '../../components/HomePanel';

interface ModulosProps {
    children: ReactNode;
}

export default async function ModulosPage({ children }: ModulosProps): Promise<React.JSX.Element> {    
    return (
        <>
            <HomePanel />            
        </>
    );
}