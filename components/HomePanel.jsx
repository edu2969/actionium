"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './HomePanel.css';

export default function EditTask() {
    const svgRef = useRef();
    const [notifications, setNotifications] = useState(12);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [activeClient, setActiveClient] = useState("setop"); // Cliente inicial con contratos

    // Manejar redimensionamiento
    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current && svgRef.current.parentElement) {
                const container = svgRef.current.parentElement;
                const newWidth = container.clientWidth || 800;
                const newHeight = container.clientHeight || 500;
                console.log('Dimensiones actualizadas:', { width: newWidth, height: newHeight });
                setDimensions({
                    width: newWidth,
                    height: newHeight
                });
            }
        };

        // Dar tiempo para que el DOM se renderice
        setTimeout(updateDimensions, 100);
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Datos expandidos para el panel futurista
    const companyData = {
        central: { id: "yGa", type: "company", health: 95, power: 87, efficiency: 92, logo: "/clientes/yga-neon.png" },
        clients: [
            { 
                id: "kskin", 
                type: "client", 
                health: 85, 
                alerts: ["retraso_pago"], 
                logo: "/clientes/kskin-neon.png", 
                revenue: 2.5, 
                growth: 12,
                contracts: [
                    { 
                        id: "kskin-c1", 
                        name: "Desarrollo Web", 
                        status: "active", 
                        profitability: 85, 
                        notifications: [
                            { type: "payment", message: "Pago pendiente" }
                        ]
                    },
                    { 
                        id: "kskin-c2", 
                        name: "Mantenimiento", 
                        status: "pending", 
                        profitability: 65,
                        notifications: []
                    }
                ]
            },
            { 
                id: "setop", 
                type: "client", 
                health: 92, 
                alerts: [], 
                logo: "/clientes/setop-neon.png", 
                revenue: 3.8, 
                growth: 18,
                contracts: [
                    { 
                        id: "setop-c1", 
                        name: "Sistema ERP", 
                        status: "active", 
                        profitability: 92,
                        notifications: []
                    },
                    { 
                        id: "setop-c2", 
                        name: "App Mobile", 
                        status: "pending", 
                        profitability: 78,
                        notifications: [
                            { type: "deadline", message: "Próximo entregable" },
                            { type: "review", message: "Revisión pendiente" }
                        ]
                    },
                    { 
                        id: "setop-c3", 
                        name: "Integración API", 
                        status: "suspended", 
                        profitability: 45,
                        notifications: [
                            { type: "issue", message: "Problema técnico" }
                        ]
                    }
                ]
            },
            { 
                id: "biox", 
                type: "client", 
                health: 78, 
                alerts: ["retraso_tarea", "retraso_respuesta"], 
                logo: "/clientes/bioxspa-neon.png", 
                revenue: 4.2, 
                growth: -5,
                contracts: [
                    { 
                        id: "biox-c1", 
                        name: "Plataforma Bio", 
                        status: "active", 
                        profitability: 70,
                        notifications: [
                            { type: "milestone", message: "Hito alcanzado" }
                        ]
                    },
                    { 
                        id: "biox-c2", 
                        name: "Dashboard Analytics", 
                        status: "expired", 
                        profitability: 35,
                        notifications: [
                            { type: "renewal", message: "Renovación requerida" },
                            { type: "payment", message: "Pago atrasado" }
                        ]
                    }
                ]
            },
            { 
                id: "jpelectric", 
                type: "client", 
                health: 95, 
                alerts: [], 
                logo: "/clientes/jpelectric-neon.png", 
                revenue: 5.1, 
                growth: 25,
                contracts: [
                    { 
                        id: "jpelectric-c1", 
                        name: "Sistema Facturación", 
                        status: "active", 
                        profitability: 95,
                        notifications: []
                    },
                    { 
                        id: "jpelectric-c2", 
                        name: "Portal Cliente", 
                        status: "pending", 
                        profitability: 80,
                        notifications: [
                            { type: "approval", message: "Aprobación pendiente" }
                        ]
                    },
                    { 
                        id: "jpelectric-c3", 
                        name: "App Técnicos", 
                        status: "active", 
                        profitability: 88,
                        notifications: []
                    }
                ]
            },
            { 
                id: "simen", 
                type: "client", 
                health: 68, 
                alerts: ["retraso_respuesta"], 
                logo: "/clientes/simen-neon.png", 
                revenue: 1.9, 
                growth: 8,
                contracts: [
                    { 
                        id: "simen-c1", 
                        name: "Web Corporativa", 
                        status: "cancelled", 
                        profitability: 20,
                        notifications: [
                            { type: "refund", message: "Reembolso procesado" }
                        ]
                    }
                ]
            }
        ]
    };

    const systemMetrics = {
        cpu: 73,
        memory: 68,
        network: 89,
        storage: 45,
        temperature: 42,
        uptime: "99.97%"
    };

    const financialData = {
        revenue: { current: 18.8, target: 22.0, currency: "M USD" },
        profit: { current: 4.2, target: 5.5, currency: "M USD" },
        growth: { current: 15.3, target: 18.0, unit: "%" },
        efficiency: { current: 87, target: 95, unit: "%" }
    };

    const projectStatus = [
        { name: "Alpha Protocol", progress: 87, status: "active", priority: "high" },
        { name: "Beta Framework", progress: 65, status: "active", priority: "medium" },
        { name: "Gamma Suite", progress: 23, status: "planning", priority: "low" },
        { name: "Delta Security", progress: 94, status: "testing", priority: "critical" }
    ];

    const securityAlerts = [
        { type: "warning", message: "Unusual access pattern detected", time: "2 min ago", severity: 3 },
        { type: "info", message: "System backup completed", time: "5 min ago", severity: 1 },
        { type: "critical", message: "Authentication failure threshold", time: "8 min ago", severity: 5 }
    ];

    const contractIssues = [
        { title: "Contrato Tesla Q4", issue: "Retraso en entregables", severity: "high", impact: 85 },
        { title: "Recurso dañado", issue: "Servidor principal en mantenimiento", severity: "medium", impact: 45 },
        { title: "Licencia Microsoft", issue: "Renovación pendiente", severity: "low", impact: 15 }
    ];

    const complaints = [
        { client: "Apple", category: "Comunicación", level: 3, text: "Respuestas lentas del equipo", timestamp: "1h ago" },
        { client: "Meta", category: "Calidad", level: 2, text: "Errores en entregables", timestamp: "3h ago" }
    ];

    useEffect(() => {
        if (!svgRef.current) {
            console.log('SVG ref no disponible');
            return;
        }

        // Pequeño delay para asegurar que el estado se establezca
        const timeoutId = setTimeout(() => {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            // Usar las dimensiones del estado
            const { width, height } = dimensions;
            console.log('Creando grafo inicial completo con dimensiones:', { width, height });
            
            // Crear nodos: central + clientes + TODOS los contratos desde el inicio
            const nodes = [
                companyData.central,
                ...companyData.clients
            ];

            // Agregar contratos del cliente activo (si hay uno)
            const allContractNodes = [];
            
            if (activeClient) {
                const clientWithContracts = companyData.clients.find(c => c.id === activeClient);
                if (clientWithContracts && clientWithContracts.contracts) {
                    const contractNodes = clientWithContracts.contracts.map(contract => ({
                        ...contract,
                        type: "contract",
                        parentId: clientWithContracts.id
                    }));
                    allContractNodes.push(...contractNodes);
                }
            }
            nodes.push(...allContractNodes);

            // Enlaces entre central y clientes
            const links = companyData.clients.map(client => ({
                source: "yGa",
                target: client.id,
                type: "connection"
            }));

            // Enlaces solo para los contratos del cliente activo
            if (activeClient) {
                const clientWithContracts = companyData.clients.find(c => c.id === activeClient);
                if (clientWithContracts && clientWithContracts.contracts) {
                    const contractLinks = clientWithContracts.contracts.map(contract => ({
                        source: clientWithContracts.id,
                        target: contract.id,
                        type: "contract"
                    }));
                    links.push(...contractLinks);
                }
            }

            console.log('Nodos totales:', nodes.length, 'Enlaces totales:', links.length);

        // Configurar simulación simple y natural para estructura de árbol
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id)
                .distance(d => {
                    if (d.type === "contract") return 90; // Distancia fija para contratos
                    return 100; // Distancia para clientes al centro (equilibrada)
                })
                .strength(0.8)) // Fuerza de enlace moderada
            .force("charge", d3.forceManyBody()
                .strength(d => {
                    if (d.type === "company") return -400; // Centro con repulsión fuerte
                    if (d.type === "client") return -250;  // Clientes con repulsión media
                    return -180; // Contratos con repulsión suave
                }))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide()
                .radius(d => {
                    if (d.type === "company") return 50;
                    if (d.type === "client") return 40;
                    return 35; // Contratos más compactos
                })
                .strength(0.9)) // Evitar solapamientos
            .alpha(0.5) // Alpha inicial más alto para mejor distribución
            .alphaDecay(0.02); // Decay lento para estabilización gradual

        // POSICIONAMIENTO INICIAL INTELIGENTE para evitar cruces de líneas
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Posicionar clientes en círculo alrededor del centro (distancia equilibrada)
        const clientRadius = Math.min(width, height) * 0.2; // Ajustado a 0.2 para balancear con distancia 100
        companyData.clients.forEach((client, index) => {
            const angle = (index / companyData.clients.length) * 2 * Math.PI;
            const clientNode = nodes.find(n => n.id === client.id);
            if (clientNode) {
                clientNode.x = centerX + Math.cos(angle) * clientRadius;
                clientNode.y = centerY + Math.sin(angle) * clientRadius;
            }
        });

        // Posicionar contratos estratégicamente hacia el exterior
        nodes.filter(n => n.type === "contract").forEach(contract => {
            const parentClient = nodes.find(n => n.id === contract.parentId);
            if (parentClient) {
                // Calcular ángulo desde centro hacia cliente
                const clientAngle = Math.atan2(parentClient.y - centerY, parentClient.x - centerX);
                
                // Obtener todos los contratos del mismo cliente para distribuirlos
                const siblingContracts = nodes.filter(n => n.type === "contract" && n.parentId === contract.parentId);
                const contractIndex = siblingContracts.indexOf(contract);
                const totalContracts = siblingContracts.length;
                
                // Distribución angular para múltiples contratos
                let contractAngle = clientAngle;
                if (totalContracts > 1) {
                    const angleSpread = Math.PI / 4; // 45 grados de extensión total
                    const angleStep = angleSpread / Math.max(totalContracts - 1, 1);
                    contractAngle = clientAngle - (angleSpread / 2) + (contractIndex * angleStep);
                }
                
                // Posicionar contrato hacia el exterior del cliente
                const contractDistance = clientRadius + 120; // Distancia desde el centro
                contract.x = centerX + Math.cos(contractAngle) * contractDistance;
                contract.y = centerY + Math.sin(contractAngle) * contractDistance;
            }
        });

        // Posicionar nodo central
        const centralNode = nodes.find(n => n.type === "company");
        if (centralNode) {
            centralNode.x = centerX;
            centralNode.y = centerY;
        }

        // SVG principal
        const mainSvg = svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        // Gradientes y filtros
        const defs = mainSvg.append("defs");
        
        // Gradiente para el fondo futurista
        const bgGradient = defs.append("radialGradient")
            .attr("id", "bgGradient")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
        bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0a0a0a");
        bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a1a2e");

        // Gradiente para nodos centrales
        const centralGradient = defs.append("radialGradient")
            .attr("id", "centralGradient");
        centralGradient.append("stop").attr("offset", "0%").attr("stop-color", "#00d4ff");
        centralGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0066cc");

        // ClipPaths circulares para logos
        companyData.clients.forEach(client => {
            const clipPath = defs.append("clipPath")
                .attr("id", `clip-${client.id}`);
            
            clipPath.append("circle")
                .attr("cx", "0")
                .attr("cy", "0")
                .attr("r", "20");
        });

        // ClipPath para el logo del nodo central
        const centralClipPath = defs.append("clipPath")
            .attr("id", "clip-yGa");
        
        centralClipPath.append("circle")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("r", "25");

        // ClipPath para nodos de contratos
        const contractClipPath = defs.append("clipPath")
            .attr("id", "clip-contract");
        
        contractClipPath.append("circle")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("r", "20"); // Mismo tamaño que el clipPath de clientes

        // Enlaces sin animaciones - aparecen directamente
        const linkSelection = mainSvg.selectAll("line.link")
            .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

        // Enlaces que salen - con animación para enlaces de contratos
        linkSelection.exit()
            .filter(d => d.type === "contract")
            .transition()
            .duration(400)
            .style("opacity", 0)
            .remove();
            
        // Enlaces normales que salen
        linkSelection.exit()
            .filter(d => d.type !== "contract")
            .remove();

        // Enlaces que entran - sin animaciones
        const linkEnter = linkSelection.enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", d => d.type === "contract" ? "#ffaa00" : "#00d4ff")
            .attr("stroke-width", d => d.type === "contract" ? 2 : 1)
            .attr("stroke-dasharray", d => d.type === "contract" ? "5,5" : "none")
            .style("opacity", d => d.type === "contract" ? 0.8 : 0.6);

        // Fusionar - sin animaciones
        const link = linkEnter.merge(linkSelection);

        // Nodos sin animaciones - aparecen directamente en el grafo
        const nodeSelection = mainSvg.selectAll("g.node")
            .data(nodes, d => d.id);

        // Nodos que salen - con animación de contracción hacia el cliente padre
        const nodeExit = nodeSelection.exit();
        
        // Animación de salida para contratos: contraer hacia el cliente padre
        nodeExit.filter(d => d.type === "contract")
            .transition()
            .duration(600)
            .ease(d3.easeCubicInOut)
            .style("opacity", 0)
            .attrTween("transform", function(d) {
                // Encontrar cliente padre para contraer hacia él
                const parentNode = nodes.find(n => n.id === d.parentId) || 
                                 companyData.clients.find(c => c.id === d.parentId);
                const currentX = d.x || 0;
                const currentY = d.y || 0;
                
                // Si no encontramos el padre en nodes, usar las posiciones calculadas
                let targetX, targetY;
                if (parentNode && parentNode.x !== undefined) {
                    targetX = parentNode.x;
                    targetY = parentNode.y;
                } else {
                    // Calcular posición del cliente padre manualmente
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const clientRadius = Math.min(width, height) * 0.2;
                    const clientIndex = companyData.clients.findIndex(c => c.id === d.parentId);
                    const angle = (clientIndex / companyData.clients.length) * 2 * Math.PI;
                    targetX = centerX + Math.cos(angle) * clientRadius;
                    targetY = centerY + Math.sin(angle) * clientRadius;
                }
                
                return function(t) {
                    const x = currentX + (targetX - currentX) * t;
                    const y = currentY + (targetY - currentY) * t;
                    const scale = 1 - t * 0.9; // Escala de 1 a 0.1
                    return `translate(${x}, ${y}) scale(${scale})`;
                };
            })
            .remove();

        // Otros nodos que salen (sin animación especial)
        nodeExit.filter(d => d.type !== "contract")
            .remove();

        // Nodos que entran - sin animaciones de entrada
        const nodeEnter = nodeSelection.enter()
            .append("g")
            .attr("class", "node")
            .style("opacity", 1) // Completamente visibles desde el inicio
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Fusionar enter + update
        const node = nodeEnter.merge(nodeSelection);

        // Círculos de nodos - sin animaciones
        nodeEnter.append("circle")
            .attr("r", d => {
                if (d.type === "company") return 40;
                if (d.type === "contract") return 30;
                return 30;
            })
            .attr("fill", d => {
                if (d.type === "company") return "#1a1a2e";
                if (d.type === "contract") return "#2a2a3e";
                return "#16213e";
            })
            .attr("stroke", d => {
                if (d.type === "company") return "#00d4ff";
                if (d.type === "contract") return "#ffaa00";
                return "#00d4ff";
            })
            .attr("stroke-width", d => {
                if (d.type === "company") return 2;
                if (d.type === "contract") return 1;
                return 2;
            });

        // Indicadores de salud (anillos) - solo para nodos nuevos
        nodeEnter.filter(d => d.type === "client")
            .append("circle")
            .attr("r", 35)
            .attr("fill", "none")
            .attr("stroke", d => getHealthColor(d.health))
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", d => `${(d.health / 100) * 220} 220`)
            .attr("opacity", 0.8);

        // Indicador de salud para el nodo central (mismo estilo que clientes)
        nodeEnter.filter(d => d.type === "company")
            .append("circle")
            .attr("r", 45)
            .attr("fill", "none")
            .attr("stroke", d => getHealthColor(d.health))
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", d => `${(d.health / 100) * 283} 283`) // 283 = 2 * π * 45
            .attr("opacity", 0.8);

        // Logos/texto - solo para nodos nuevos
        // Imagen circular para el nodo central
        nodeEnter.filter(d => d.type === "company")
            .append("image")
            .attr("href", "/clientes/yga-neon.png")
            .attr("x", -25)
            .attr("y", -25)
            .attr("width", 50)
            .attr("height", 50)
            .attr("clip-path", "url(#clip-yGa)")
            .attr("preserveAspectRatio", "xMidYMid slice");

        // Bordes para el nodo central
        nodeEnter.filter(d => d.type === "company")
            .append("circle")
            .attr("r", 25)
            .attr("fill", "none")
            .attr("stroke", "#00d4ff")
            .attr("stroke-width", 2);

        // Imágenes circulares para clientes
        nodeEnter.filter(d => d.type === "client")
            .append("image")
            .attr("href", d => d.logo)
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", d => `url(#clip-${d.id})`)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                event.stopPropagation(); // Evitar que se propague al nodo padre
                
                // Si este cliente ya está activo, desactivarlo (ocultar contratos)
                if (activeClient === d.id) {
                    setActiveClient(null); // Esto triggereará la animación de contracción
                } else {
                    // Si hay otro cliente activo, primero ocultar sus contratos
                    // Luego activar el nuevo cliente
                    setActiveClient(d.id);
                }
            });

        // Bordes para los clientes
        nodeEnter.filter(d => d.type === "client")
            .append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", "#00d4ff")
            .attr("stroke-width", 1);

        // Nodos de contratos - sin animaciones
        // Imagen para los nodos de contratos
        nodeEnter.filter(d => d.type === "contract")
            .append("foreignObject")
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", "url(#clip-contract)")
            .html(`
                <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #2a2a3e, #1a1a2e);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffaa00">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" fill="#00d4ff"/>
                    </svg>
                </div>
            `);

        // Bordes para los contratos (línea punteada)
        nodeEnter.filter(d => d.type === "contract")
            .append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", "#ffaa00")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Indicador de estado del contrato (círculo exterior)
        nodeEnter.filter(d => d.type === "contract")
            .append("circle")
            .attr("r", 35)
            .attr("fill", "none")
            .attr("stroke", d => getContractStatusColor(d.status))
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", d => `${(d.profitability || 50) / 100 * 220} 220`) // Rentabilidad como progreso
            .attr("opacity", 0.8);

        // Estado del contrato (texto)
        nodeEnter.filter(d => d.type === "contract")
            .append("text")
            .text(d => getContractStatusText(d.status))
            .attr("text-anchor", "middle")
            .attr("dy", "30")
            .attr("fill", d => getContractStatusColor(d.status))
            .attr("font-size", "8px")
            .attr("font-weight", "bold");

        // Rentabilidad del contrato (texto)
        nodeEnter.filter(d => d.type === "contract")
            .append("text")
            .text(d => `${d.profitability || 0}%`)
            .attr("text-anchor", "middle")
            .attr("dy", "42")
            .attr("fill", "#00d4ff")
            .attr("font-size", "7px");

        // Notificaciones para contratos
        nodeEnter.filter(d => d.type === "contract" && d.notifications && d.notifications.length > 0)
            .append("circle")
            .attr("r", 6)
            .attr("fill", "#ff4444")
            .attr("cx", 20)
            .attr("cy", -20);

        nodeEnter.filter(d => d.type === "contract" && d.notifications && d.notifications.length > 0)
            .append("text")
            .text(d => d.notifications.length)
            .attr("text-anchor", "middle")
            .attr("dy", "3")
            .attr("x", 20)
            .attr("y", -20)
            .attr("fill", "white")
            .attr("font-size", "8px")
            .attr("font-weight", "bold");

        // Alertas
        nodeEnter.filter(d => d.alerts && d.alerts.length > 0)
            .append("circle")
            .attr("r", 8)
            .attr("cx", 25)
            .attr("cy", -25)
            .attr("fill", "#ff4444");

        nodeEnter.filter(d => d.alerts && d.alerts.length > 0)
            .append("text")
            .text(d => d.alerts.length)
            .attr("x", 25)
            .attr("y", -21)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px");

        // Funciones de drag
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Actualizar posiciones - TODOS los nodos se mueven por simulación
        simulation.on("tick", () => {
            // Actualizar líneas (todas)
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // Actualizar TODOS los nodos 
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Reiniciar simulación para todos los nodos
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(0.3).restart();

        return () => {
            simulation.stop();
        };
        }, 100); // Delay de 100ms para asegurar que el estado se establezca

        return () => {
            clearTimeout(timeoutId);
        };
    }, [dimensions, activeClient]); // Incluir activeClient para reaccionar a cambios

    const getHealthColor = (health) => {
        if (health >= 90) return "#00ff00";
        if (health >= 70) return "#ffff00";
        if (health >= 50) return "#ff8800";
        return "#ff0000";
    };

    const getAlertText = (alert) => {
        const alertTexts = {
            retraso_pago: "Retraso en pago",
            retraso_tarea: "Retraso en tarea",
            retraso_respuesta: "Retraso en respuesta"
        };
        return alertTexts[alert] || alert;
    };

    const getContractStatusColor = (status) => {
        const statusColors = {
            active: "#00ff00",      // Verde - Contrato activo
            pending: "#ffff00",     // Amarillo - Pendiente
            expired: "#ff8800",     // Naranja - Expirado
            cancelled: "#ff0000",   // Rojo - Cancelado
            suspended: "#ff00ff"    // Magenta - Suspendido
        };
        return statusColors[status] || "#00d4ff";
    };

    const getContractStatusText = (status) => {
        const statusTexts = {
            active: "ACTIVO",
            pending: "PENDIENTE", 
            expired: "EXPIRADO",
            cancelled: "CANCELADO",
            suspended: "SUSPENDIDO"
        };
        return statusTexts[status] || "DESCONOCIDO";
    };

    return (
        <div className="home-panel">
            <div className="glass-panel">
                {/* Panel principal con el grafo */}
                <div className="main-graph">
                    <svg ref={svgRef} className="graph-svg"></svg>
                </div>

                {/* Panel de información lateral */}
                <div className="info-panel">
                    <div className="panel-section">
                        <h3>Contratos Críticos</h3>
                        {contractIssues.map((issue, index) => (
                            <div key={index} className={`issue-item ${issue.severity}`}>
                                <span className="issue-title">{issue.title}</span>
                                <span className="issue-text">{issue.issue}</span>
                            </div>
                        ))}
                    </div>

                    <div className="panel-section">
                        <h3>Quejas Recientes</h3>
                        {complaints.map((complaint, index) => (
                            <div key={index} className="complaint-item">
                                <div className="complaint-header">
                                    <span className="client-name">{complaint.client}</span>
                                    <span className={`level level-${complaint.level}`}>Nivel {complaint.level}</span>
                                </div>
                                <div className="complaint-category">{complaint.category}</div>
                                <div className="complaint-text">{complaint.text}</div>
                            </div>
                        ))}
                    </div>

                    <div className="panel-section">
                        <div className="notifications-bar">
                            <span className="notification-count">{notifications}</span>
                            <span>Notificaciones</span>
                            <button className="more-btn">Más</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};