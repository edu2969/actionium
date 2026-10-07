export default function About() {
    return (
        <main
            className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
            }}
        >
            <div className="relative aspect-square h-[min(100vw,100vh)] w-[min(100vw,100vh)] animate-entrance">
                <img
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    src="/panel/marco_especial.png"
                    alt=""
                    aria-hidden="true"
                />
                <div className="absolute left-1/2 top-[20%] flex -translate-x-1/2 flex-col items-center">
                    <span className="text-xs text-gray-400">Powered By</span>
                    <img
                        src="/yga-logo.png"
                        width={211}
                        alt="yGa"
                    />
                </div>
                <div className="absolute left-1/2 top-[50%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-8">
                    <div className="text-center">
                        <h1 className="text-center text-5xl text-gray-200 sm:text-7xl">
                            A C T I O N I U M
                        </h1>
                        <p className="text-sm text-gray-400">
                            versión 1.0
                        </p>
                    </div>                    
                </div>
                <div className="absolute left-1/2 top-[87%] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <p className="text-center text-md uppercase text-gray-400">
                        Contáctenos vía e-mail a{" "}
                        <a
                            className="text-blue-600"
                            href="mailto:contacto@yga.cl"
                        >
                            contacto@yga.cl
                        </a>
                    </p>
                </div>
            </div>
        </main>
    );
}