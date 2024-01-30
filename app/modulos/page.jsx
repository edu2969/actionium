import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import HomeAdministrador from "./administrador/page";
import HomeInventario from "./inventario/page";
import HomeOrdenes from "./ordenes/page";
import HomeGerencia from "./gerencia/page";
import { USER_ROLE } from "../utils/constants";

export default async function Modulos({ children }) {
    const session = await getServerSession(authOptions);
    return (
        <>
            {session.user?.role == USER_ROLE.neo ?
                (<HomeAdministrador></HomeAdministrador>)
                : session.user?.role == USER_ROLE.manager ?
                    (<HomeGerencia></HomeGerencia>)
                    : session.user?.role == USER_ROLE.orders ?
                        (<HomeOrdenes></HomeOrdenes>)
                        : session.user?.rol == USER_ROLE.toolManager ?
                            (<HomeInventario></HomeInventario>)
                            : (<HomeInventario></HomeInventario>)}
        </>
    );
}