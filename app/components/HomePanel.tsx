"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './HomePanel.css';
import { useQuery } from "@tanstack/react-query";
import { DashboardResponse, DashboardCentral, DashboardClient, DashboardContract } from '@/lib/types';

// Tipos para los nodos del grafo
interface GraphNode extends DashboardCentral {
    parentId?: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
    alerts?: string[];
    notifications?: Array<{ type: string; message: string }>;
    profitability?: number;
    status?: string;
    name?: string;
}

interface GraphLink {
    source: string;
    target: string;
    type: 'connection' | 'contract';
}

export default function HomePanel() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [notifications] = useState(12);
    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [activeClient, setActiveClient] = useState<string | null>(null);

    // Manejar redimensionamiento
    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window !== 'undefined') {
                const newWidth = window.innerWidth - 350;
                const newHeight = window.innerHeight;
                setDimensions({
                    width: newWidth,
                    height: newHeight
                });
            }
        };

        setTimeout(updateDimensions, 100);
        
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateDimensions);
        }
        
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateDimensions);
            }
        };
    }, []);

    // Fetch datos del dashboard
    const { data: companyData, isLoading: isCompanyLoading } = useQuery<DashboardResponse>({
        queryKey: ["panel-data"],
        queryFn: async () => {
            const resp = await fetch("/api/company/dashboard");
            if (!resp.ok) {
                throw new Error('Error fetching dashboard data');
            }
            return await resp.json();
        }
    });

    // Renderizar grafo
    useEffect(() => {
        if (!svgRef.current || !companyData || isCompanyLoading) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();

            const { width, height } = dimensions;
            const { central, clients } = companyData;

            // Crear nodos
            const nodes: GraphNode[] = [
                { ...central, type: 'company' },
                ...clients.map(c => ({ ...c, type: 'client' as const }))
            ];

            // Agregar contratos del cliente activo
            if (activeClient) {
                const clientWithContracts = clients.find(c => c.id === activeClient);
                if (clientWithContracts && clientWithContracts.contracts) {
                    const contractNodes: GraphNode[] = clientWithContracts.contracts.map(contract => ({
                        id: contract.id,
                        name: contract.name,
                        status: contract.status,
                        profitability: contract.profitability,
                        notifications: contract.notifications,
                        type: 'contract',
                        parentId: clientWithContracts.id,
                        health: contract.profitability || 50,
                        power: 0,
                        efficiency: 0,
                        logo: '/contract-icon.png'
                    }));
                    nodes.push(...contractNodes);
                }
            }

            // Enlaces
            const links: GraphLink[] = clients.map(client => ({
                source: central.id,
                target: client.id,
                type: 'connection'
            }));

            if (activeClient) {
                const clientWithContracts = clients.find(c => c.id === activeClient);
                if (clientWithContracts && clientWithContracts.contracts) {
                    const contractLinks: GraphLink[] = clientWithContracts.contracts.map(contract => ({
                        source: clientWithContracts.id,
                        target: contract.id,
                        type: 'contract'
                    }));
                    links.push(...contractLinks);
                }
            }

            console.log('Nodos:', nodes.length, 'Enlaces:', links.length);

            // Configurar simulación
            const simulation = d3.forceSimulation(nodes as any)
                .force("link", d3.forceLink(links as any).id((d: any) => d.id)
                    .distance((d: any) => {
                        if (d.type === "contract") return 150;
                        return 200;
                    })
                    .strength(0.8))
                .force("charge", d3.forceManyBody()
                    .strength((d: any) => {
                        if (d.type === "company") return -800;
                        if (d.type === "client") return -400;
                        return -250;
                    }))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collision", d3.forceCollide()
                    .radius((d: any) => {
                        if (d.type === "company") return 60;
                        if (d.type === "client") return 50;
                        return 45;
                    })
                    .strength(0.9))
                .alpha(0.5)
                .alphaDecay(0.02);

            // Posicionamiento inicial
            const centerX = width / 2;
            const centerY = height / 2;
            const clientRadius = Math.min(width, height) * 0.25;

            clients.forEach((client, index) => {
                const angle = (index / clients.length) * 2 * Math.PI;
                const clientNode = nodes.find(n => n.id === client.id);
                if (clientNode) {
                    clientNode.x = centerX + Math.cos(angle) * clientRadius;
                    clientNode.y = centerY + Math.sin(angle) * clientRadius;
                }
            });

            // Posicionar contratos
            nodes.filter(n => n.type === "contract").forEach((contract, index) => {
                const parentClient = nodes.find(n => n.id === contract.parentId);
                if (parentClient) {
                    const clientAngle = Math.atan2(parentClient.y! - centerY, parentClient.x! - centerX);
                    const siblingContracts = nodes.filter(n => n.type === "contract" && n.parentId === contract.parentId);
                    const contractIndex = siblingContracts.indexOf(contract);
                    const totalContracts = siblingContracts.length;
                    
                    let contractAngle = clientAngle;
                    if (totalContracts > 1) {
                        const angleSpread = Math.PI / 4;
                        const angleStep = angleSpread / Math.max(totalContracts - 1, 1);
                        contractAngle = clientAngle - (angleSpread / 2) + (contractIndex * angleStep);
                    }
                    
                    const contractDistance = clientRadius + 180;
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

            // Defs
            const defs = mainSvg.append("defs");
            
            const bgGradient = defs.append("radialGradient")
                .attr("id", "bgGradient")
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");
            bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0a0a0a");
            bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a1a2e");

            // ClipPaths para logos
            clients.forEach(client => {
                const clipPath = defs.append("clipPath")
                    .attr("id", `clip-${client.id}`);
                clipPath.append("circle")
                    .attr("cx", "0")
                    .attr("cy", "0")
                    .attr("r", "20");
            });

            const centralClipPath = defs.append("clipPath")
                .attr("id", "clip-central");
            centralClipPath.append("circle")
                .attr("cx", "0")
                .attr("cy", "0")
                .attr("r", "25");

            const contractClipPath = defs.append("clipPath")
                .attr("id", "clip-contract");
            contractClipPath.append("circle")
                .attr("cx", "0")
                .attr("cy", "0")
                .attr("r", "20");

            // Enlaces
            const linkSelection = mainSvg.selectAll<SVGLineElement, GraphLink>("line.link")
                .data(links, (d: GraphLink) => `${d.source}-${d.target}`);

            linkSelection.exit()
                .filter((d: GraphLink) => d.type === "contract")
                .transition()
                .duration(400)
                .style("opacity", 0)
                .remove();

            linkSelection.exit()
                .filter((d: GraphLink) => d.type !== "contract")
                .remove();

            const linkEnter = linkSelection.enter()
                .append("line")
                .attr("class", "link")
                .attr("stroke", (d: GraphLink) => d.type === "contract" ? "#ffaa00" : "#00d4ff")
                .attr("stroke-width", (d: GraphLink) => d.type === "contract" ? 2 : 1)
                .attr("stroke-dasharray", (d: GraphLink) => d.type === "contract" ? "5,5" : "none")
                .style("opacity", (d: GraphLink) => d.type === "contract" ? 0.8 : 0.6);

            const link = linkEnter.merge(linkSelection);

            // Nodos
            const nodeSelection = mainSvg.selectAll<SVGGElement, GraphNode>("g.node")
                .data(nodes, (d: GraphNode) => d.id);

            const nodeExit = nodeSelection.exit();
            
            nodeExit.filter((d: GraphNode) => d.type === "contract")
                .transition()
                .duration(600)
                .ease(d3.easeCubicInOut)
                .style("opacity", 0)
                .attrTween("transform", function(d: GraphNode) {
                    const parentNode = nodes.find(n => n.id === d.parentId);
                    const currentX = d.x || 0;
                    const currentY = d.y || 0;
                    
                    let targetX: number, targetY: number;
                    if (parentNode && parentNode.x !== undefined) {
                        targetX = parentNode.x;
                        targetY = parentNode.y;
                    } else {
                        const centerX = width / 2;
                        const centerY = height / 2;
                        const clientRadius = Math.min(width, height) * 0.2;
                        const clientIndex = clients.findIndex(c => c.id === d.parentId);
                        const angle = (clientIndex / clients.length) * 2 * Math.PI;
                        targetX = centerX + Math.cos(angle) * clientRadius;
                        targetY = centerY + Math.sin(angle) * clientRadius;
                    }
                    
                    return function(t: number) {
                        const x = currentX + (targetX - currentX) * t;
                        const y = currentY + (targetY - currentY) * t;
                        const scale = 1 - t * 0.9;
                        return `translate(${x}, ${y}) scale(${scale})`;
                    };
                })
                .remove();

            nodeExit.filter((d: GraphNode) => d.type !== "contract")
                .remove();

            const nodeEnter = nodeSelection.enter()
                .append("g")
                .attr("class", "node")
                .style("opacity", 1)
                .call(d3.drag<SVGGElement, GraphNode>()
                    .on("start", function(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x || 0;
                        d.fy = d.y || 0;
                    })
                    .on("drag", function(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", function(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
                );

            const node = nodeEnter.merge(nodeSelection);

            // Círculos de nodos
            nodeEnter.append("circle")
                .attr("r", (d: GraphNode) => {
                    if (d.type === "company") return 40;
                    if (d.type === "contract") return 30;
                    return 30;
                })
                .attr("fill", (d: GraphNode) => {
                    if (d.type === "company") return "#1a1a2e";
                    if (d.type === "contract") return "#2a2a3e";
                    return "#16213e";
                })
                .attr("stroke", (d: GraphNode) => {
                    if (d.type === "company") return "#00d4ff";
                    if (d.type === "contract") return "#ffaa00";
                    return "#00d4ff";
                })
                .attr("stroke-width", (d: GraphNode) => {
                    if (d.type === "company") return 2;
                    if (d.type === "contract") return 1;
                    return 2;
                });

            // Indicadores de salud
            nodeEnter.filter((d: GraphNode) => d.type === "client")
                .append("circle")
                .attr("r", 35)
                .attr("fill", "none")
                .attr("stroke", (d: GraphNode) => getHealthColor(d.health || 50))
                .attr("stroke-width", 3)
                .attr("stroke-dasharray", (d: GraphNode) => `${((d.health || 50) / 100) * 220} 220`)
                .attr("opacity", 0.8);

            nodeEnter.filter((d: GraphNode) => d.type === "company")
                .append("circle")
                .attr("r", 45)
                .attr("fill", "none")
                .attr("stroke", (d: GraphNode) => getHealthColor(d.health || 80))
                .attr("stroke-width", 3)
                .attr("stroke-dasharray", (d: GraphNode) => `${((d.health || 80) / 100) * 283} 283`)
                .attr("opacity", 0.8);

            // Logo central
            nodeEnter.filter((d: GraphNode) => d.type === "company")
                .append("image")
                .attr("href", "/clientes/yga-neon.png")
                .attr("x", -25)
                .attr("y", -25)
                .attr("width", 50)
                .attr("height", 50)
                .attr("clip-path", "url(#clip-central)")
                .attr("preserveAspectRatio", "xMidYMid slice");

            nodeEnter.filter((d: GraphNode) => d.type === "company")
                .append("circle")
                .attr("r", 25)
                .attr("fill", "none")
                .attr("stroke", "#00d4ff")
                .attr("stroke-width", 2);

            // Logos de clientes
            nodeEnter.filter((d: GraphNode) => d.type === "client")
                .append("image")
                .attr("href", (d: GraphNode) => d.logo || '/clientes/default.png')
                .attr("x", -20)
                .attr("y", -20)
                .attr("width", 40)
                .attr("height", 40)
                .attr("clip-path", (d: GraphNode) => `url(#clip-${d.id})`)
                .attr("preserveAspectRatio", "xMidYMid slice")
                .style("cursor", "pointer")
                .on("click", function(event: MouseEvent, d: GraphNode) {
                    event.stopPropagation();
                    if (activeClient === d.id) {
                        setActiveClient(null);
                    } else {
                        setActiveClient(d.id);
                    }
                });

            nodeEnter.filter((d: GraphNode) => d.type === "client")
                .append("circle")
                .attr("r", 20)
                .attr("fill", "none")
                .attr("stroke", "#00d4ff")
                .attr("stroke-width", 1);

            // Nodos de contratos
            nodeEnter.filter((d: GraphNode) => d.type === "contract")
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

            nodeEnter.filter((d: GraphNode) => d.type === "contract")
                .append("circle")
                .attr("r", 20)
                .attr("fill", "none")
                .attr("stroke", "#ffaa00")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");

            // Indicador de estado del contrato
            nodeEnter.filter((d: GraphNode) => d.type === "contract")
                .append("circle")
                .attr("r", 35)
                .attr("fill", "none")
                .attr("stroke", (d: GraphNode) => getContractStatusColor(d.status || 'suspended'))
                .attr("stroke-width", 3)
                .attr("stroke-dasharray", (d: GraphNode) => `${((d.profitability || 50) / 100) * 220} 220`)
                .attr("opacity", 0.8);

            // Estado del contrato
            nodeEnter.filter((d: GraphNode) => d.type === "contract")
                .append("text")
                .text((d: GraphNode) => getContractStatusText(d.status || 'suspended'))
                .attr("text-anchor", "middle")
                .attr("dy", "30")
                .attr("fill", (d: GraphNode) => getContractStatusColor(d.status || 'suspended'))
                .attr("font-size", "8px")
                .attr("font-weight", "bold");

            // Rentabilidad
            nodeEnter.filter((d: GraphNode) => d.type === "contract")
                .append("text")
                .text((d: GraphNode) => `${d.profitability || 0}%`)
                .attr("text-anchor", "middle")
                .attr("dy", "42")
                .attr("fill", "#00d4ff")
                .attr("font-size", "7px");

            // Notificaciones
            nodeEnter.filter((d: GraphNode) => d.type === "contract" && d.notifications && d.notifications.length > 0)
                .append("circle")
                .attr("r", 6)
                .attr("fill", "#ff4444")
                .attr("cx", 20)
                .attr("cy", -20);

            nodeEnter.filter((d: GraphNode) => d.type === "contract" && d.notifications && d.notifications.length > 0)
                .append("text")
                .text((d: GraphNode) => d.notifications?.length || 0)
                .attr("text-anchor", "middle")
                .attr("dy", "3")
                .attr("x", 20)
                .attr("y", -20)
                .attr("fill", "white")
                .attr("font-size", "8px")
                .attr("font-weight", "bold");

            // Alertas
            nodeEnter.filter((d: GraphNode) => d.alerts && d.alerts.length > 0)
                .append("circle")
                .attr("r", 8)
                .attr("cx", 25)
                .attr("cy", -25)
                .attr("fill", "#ff4444");

            nodeEnter.filter((d: GraphNode) => d.alerts && d.alerts.length > 0)
                .append("text")
                .text((d: GraphNode) => d.alerts?.length || 0)
                .attr("x", 25)
                .attr("y", -21)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", "10px");

            // Actualizar posiciones
            simulation.on("tick", () => {
                link
                    .attr("x1", (d: any) => d.source.x)
                    .attr("y1", (d: any) => d.source.y)
                    .attr("x2", (d: any) => d.target.x)
                    .attr("y2", (d: any) => d.target.y);

                node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
            });

            simulation.nodes(nodes as any);
            const linkForce = simulation.force("link") as d3.ForceLink<any, any>;
            if (linkForce) {
                linkForce.links(links as any);
            }
            simulation.alpha(0.3).restart();

            return () => {
                simulation.stop();
            };
        }, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [dimensions, activeClient, companyData, isCompanyLoading]);

    // Funciones helper
    const getHealthColor = (health: number): string => {
        if (health >= 90) return "#00ff00";
        if (health >= 70) return "#ffff00";
        if (health >= 50) return "#ff8800";
        return "#ff0000";
    };

    const getContractStatusColor = (status: string): string => {
        const statusColors: Record<string, string> = {
            active: "#00ff00",
            pending: "#ffff00",
            expired: "#ff8800",
            cancelled: "#ff0000",
            suspended: "#ff00ff",
            completed: "#00d4ff"
        };
        return statusColors[status] || "#00d4ff";
    };

    const getContractStatusText = (status: string): string => {
        const statusTexts: Record<string, string> = {
            active: "ACTIVO",
            pending: "PENDIENTE",
            expired: "EXPIRADO",
            cancelled: "CANCELADO",
            suspended: "SUSPENDIDO",
            completed: "COMPLETADO"
        };
        return statusTexts[status] || "DESCONOCIDO";
    };

    // Loading state
    if (isCompanyLoading) {
        return (
            <div className="home-panel">
                <div className="glass-panel">
                    <div className="loading-container mx-auto">
                        <div className="loading-spinner"></div>
                        <p>Cargando panel de control...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (!companyData) {
        return (
            <div className="home-panel">
                <div className="glass-panel">
                    <div className="error-container">
                        <h3>Error al cargar datos</h3>
                        <p>No se pudieron cargar los datos del dashboard</p>
                        <button onClick={() => window.location.reload()}>Reintentar</button>
                    </div>
                </div>
            </div>
        );
    }

    // Datos para el panel lateral - extraer contratos críticos
    const criticalContracts = companyData.clients
        .flatMap(c => c.contracts)
        .filter(c => c.status === 'suspended' || c.status === 'expired')
        .slice(0, 3);

    // Clientes con alertas
    const clientsWithAlerts = companyData.clients
        .filter(c => c.alerts && c.alerts.length > 0)
        .slice(0, 3);

    // Total de notificaciones
    const totalNotifications = companyData.clients.reduce((sum, c) => 
        sum + (c.contracts?.reduce((s, contract) => 
            s + (contract.notifications?.length || 0), 0) || 0), 0);

    return (
        <div className="home-panel">
            <div className="glass-panel">
                {/* Panel principal con el grafo */}
                <div className="main-graph">
                    <svg ref={svgRef} className="graph-svg"></svg>
                </div>

                {/* Panel de información lateral */}
                <div className="info-panel">
                    <div className="panel-header">
                        <h2>Panel de Control</h2>
                        <div className="metrics-summary">
                            <div className="metric-item">
                                <span className="metric-label">Salud</span>
                                <span className="metric-value">{companyData.central.health}%</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Eficiencia</span>
                                <span className="metric-value">{companyData.central.efficiency}%</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Clientes</span>
                                <span className="metric-value">{companyData.clients.length}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="panel-section">
                        <h3>Contratos Críticos</h3>
                        {criticalContracts.length > 0 ? (
                            criticalContracts.map((contract, index) => (
                                <div key={index} className="issue-item high">
                                    <span className="issue-title">{contract.name}</span>
                                    <span className="issue-text">Estado: {contract.status}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-issues">No hay contratos críticos</div>
                        )}
                    </div>

                    <div className="panel-section">
                        <h3>Alertas de Clientes</h3>
                        {clientsWithAlerts.length > 0 ? (
                            clientsWithAlerts.map((client, index) => (
                                <div key={index} className="complaint-item">
                                    <div className="complaint-header">
                                        <span className="client-name">{client.id}</span>
                                        <span className={`level level-${client.alerts.length}`}>
                                            {client.alerts.length} alertas
                                        </span>
                                    </div>
                                    <div className="complaint-text">
                                        {client.alerts.join(', ')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-issues">No hay alertas activas</div>
                        )}
                    </div>

                    <div className="panel-section">
                        <div className="notifications-bar">
                            <span className="notification-count">{totalNotifications}</span>
                            <span>Notificaciones</span>
                            <button className="more-btn">Más</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}