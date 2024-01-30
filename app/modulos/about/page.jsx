export default function About() {
    return (
        <div className="w-screen h-screen">
            <div className="h-screen flex justify-center items-center animate-entrance">
                <div>
                    <img src="/brand.png" width={111} height={111}/>
                    <span className="text-xs ml-7">versión 1.0</span>
                </div>
                <div className="ml-6">
                    <img src="/titulo.png" alt="Titulo"/>
                    <div className="ml-2 opacity-50">
                        <span>Powered By</span>
                        <img className="grayscale" src="/yga-logo.png" width={111} alt="yGa - Icon"/>
                        <div className="text-sm">
                            <p>Contáctenos vía e-mail a <a className="text-blue-800" href="mailto:contacto@yga.cl">contacto@yga.cl</a></p>
                        </div>                    
                    </div>                    
                </div>
            </div>            
        </div>
    )
}