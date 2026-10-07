"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./HomePanel.css";
import { useQuery } from "@tanstack/react-query";
import {
    DashboardResponse,
    DashboardCentral,
    DashboardClient,
    DashboardContract,
    ClientPreferencesResponse,
} from "@/lib/types";
import { getClientImageSrc } from "@/lib/clientImage";
import ControlPanel from "./panel/ControlPanel";

// ============================================================================
// Tipos
// ============================================================================

type NodeType = "company" | "client" | "contract" | "central";

/**
 * Nodo del grafo. Extiende SimulationNodeDatum para que d3-force pueda
 * mutar x/y/vx/vy/fx/fy sin necesidad de casts a `any`.
 */
interface GraphNode extends DashboardCentral, d3.SimulationNodeDatum {
    parentId?: string;
    alerts?: string[];
    archived?: boolean;
    notifications?: Array<{ type: string; message: string }>;
    profitability?: number | null;
    status?: string;
    name?: string;
}

/**
 * Enlace del grafo. SimulationLinkDatum ya tipa `source`/`target` como
 * `string | number | GraphNode`, que es exactamente lo que d3-force espera
 * y lo que produce en tiempo de ejecución tras `forceLink`.
 */
interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    id: string;
    type: "connection" | "contract";
}

interface TooltipState {
    x: number;
    y: number;
    title: string;
    subtitle: string;
    accent: string;
}

// ============================================================================
// Helpers puros (fuera del componente: no se recrean en cada render y no
// generan warnings de dependencias en los hooks que los usan)
// ============================================================================

const getHealthColor = (health: number): string => {
    if (health >= 90) return "#00ff9c";
    if (health >= 70) return "#ffe600";
    if (health >= 50) return "#ff8800";
    return "#ff3860";
};

const getContractStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        active: "#00ff9c",
        pending: "#ffe600",
        expired: "#ff8800",
        cancelled: "#ff3860",
        suspended: "#ff00ff",
        completed: "#00d4ff",
    };
    return statusColors[status] ?? "#00d4ff";
};

const getContractStatusText = (status: string): string => {
    const statusTexts: Record<string, string> = {
        active: "ACTIVO",
        pending: "PENDIENTE",
        expired: "EXPIRADO",
        cancelled: "CANCELADO",
        suspended: "SUSPENDIDO",
        completed: "COMPLETADO",
    };
    return statusTexts[status] ?? "DESCONOCIDO";
};

const resolveNode = (
    endpoint: string | number | GraphNode
): { x: number; y: number } => {
    if (typeof endpoint === "object") {
        return { x: endpoint.x ?? 0, y: endpoint.y ?? 0 };
    }
    return { x: 0, y: 0 };
};

/** Beep corto tipo "consola LCARS", generado con Web Audio (sin assets). */
let sharedAudioCtx: AudioContext | null = null;
const playConsoleTone = (kind: "select" | "deselect" | "alert"): void => {
    if (typeof window === "undefined") return;
    const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx();
    }
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const freqMap: Record<typeof kind, [number, number]> = {
        select: [660, 990],
        deselect: [520, 340],
        alert: [880, 220],
    };
    const [from, to] = freqMap[kind];

    osc.type = "sine";
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + 0.14);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.start(now);
    osc.stop(now + 0.18);
};

/** Anillo de "pulso" tipo LCARS al hacer click sobre un nodo. */
const spawnClickRipple = (
    group: d3.Selection<SVGGElement, GraphNode, null, undefined>,
    color: string,
    baseRadius: number
): void => {
    group
        .insert("circle", ":first-child")
        .attr("class", "click-ripple")
        .attr("r", baseRadius)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .style("opacity", 0.9)
        .transition()
        .duration(650)
        .ease(d3.easeCubicOut)
        .attr("r", baseRadius + 55)
        .style("opacity", 0)
        .remove();
};

const NODE_RADIUS: Record<NodeType, number> = {
    company: 40,
    client: 30,
    contract: 30,
    central: 80
};

// ============================================================================
// Componente
// ============================================================================

export default function HomePanel() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
        null
    );

    const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(
        null
    );
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const [includeArchivedClients, setIncludeArchivedClients] = useState(false);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    // ---- Redimensionamiento -------------------------------------------------
    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window === "undefined") return;
            setDimensions({
                width: window.innerWidth - 350,
                height: window.innerHeight,
            });
        };

        const timeoutId = window.setTimeout(updateDimensions, 100);
        window.addEventListener("resize", updateDimensions);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    // ---- Datos del dashboard -------------------------------------------------
    const {
        data: clientPreferences,
        isLoading: isPreferencesLoading,
        isError: isPreferencesError,
    } = useQuery<ClientPreferencesResponse>({
        queryKey: ["client-preferences"],
        queryFn: async () => {
            const response = await fetch("/api/clients/preferences");
            if (!response.ok) {
                throw new Error("Error fetching client preferences");
            }
            return (await response.json()) as ClientPreferencesResponse;
        },
    });

    const {
        data: companyData,
        isLoading: isDashboardLoading,
        isError: isDashboardError,
    } = useQuery<DashboardResponse>({
            queryKey: ["panel-data", includeArchivedClients],
            queryFn: async () => {
                const resp = await fetch(
                    `/api/company/dashboard?archived=${includeArchivedClients}`
                );
                if (!resp.ok) {
                    throw new Error("Error fetching dashboard data");
                }
                return (await resp.json()) as DashboardResponse;
            },
            placeholderData: (previousData) => previousData,
            enabled: clientPreferences !== undefined,
        });
    const isCompanyLoading =
        isPreferencesLoading || !clientPreferences || isDashboardLoading;

    useEffect(() => {
        if (
            selectedClientId &&
            companyData &&
            clientPreferences &&
            !companyData.clients.some(
                (client) =>
                    client.id === selectedClientId &&
                    (includeArchivedClients ||
                        (clientPreferences.preferencesByClientId[client.id]
                            ?.archived ??
                            client.archived) !== true)
            )
        ) {
            setSelectedClientId(null);
            setSelectedContractId(null);
        }
    }, [
        companyData,
        clientPreferences,
        includeArchivedClients,
        selectedClientId,
    ]);

    // ---- Enfocar la cámara (zoom/pan) sobre un nodo -------------------------
    const focusOnPoint = useCallback(
        (x: number, y: number, scale: number) => {
            if (!svgRef.current || !zoomBehaviorRef.current) return;
            const { width, height } = dimensions;
            const transform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(scale)
                .translate(-x, -y);

            d3.select(svgRef.current)
                .transition()
                .duration(700)
                .ease(d3.easeCubicInOut)
                .call(zoomBehaviorRef.current.transform, transform);
        },
        [dimensions]
    );

    const resetFocus = useCallback(() => {
        if (!svgRef.current || !zoomBehaviorRef.current) return;
        d3.select(svgRef.current)
            .transition()
            .duration(700)
            .ease(d3.easeCubicInOut)
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }, []);

    // ---- Render / actualización del grafo ------------------------------------
    useEffect(() => {
        if (
            !svgRef.current ||
            !companyData ||
            !clientPreferences ||
            isCompanyLoading
        ) return;

        const { width, height } = dimensions;
        const { central } = companyData;
        const clients: DashboardClient[] = companyData.clients.filter(
            (client) =>
                includeArchivedClients ||
                (clientPreferences.preferencesByClientId[client.id]
                    ?.archived ??
                    client.archived) !== true
        );

        const svg = d3.select(svgRef.current);
        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        // --- Setup persistente (solo la primera vez) ---------------------------
        let root = svg.select<SVGGElement>("g.zoom-root");
        const isFirstRun = root.empty();

        if (isFirstRun) {
            const defs = svg.append("defs");

            const bgGradient = defs
                .append("radialGradient")
                .attr("id", "bgGradient")
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");
            bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0a0a0a");
            bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1a1a2e");

            const glow = defs
                .append("filter")
                .attr("id", "lcars-glow")
                .attr("x", "-75%")
                .attr("y", "-75%")
                .attr("width", "250%")
                .attr("height", "250%");
            glow.append("feGaussianBlur").attr("stdDeviation", 4).attr("result", "blur");
            const feMerge = glow.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "blur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            defs.append("clipPath").attr("id", "clip-central").append("circle").attr("r", 25);
            defs.append("clipPath").attr("id", "clip-contract").append("circle").attr("r", 20);
            defs.append("g").attr("class", "client-clip-defs");

            root = svg.append("g").attr("class", "zoom-root");
            root.append("g").attr("class", "links-layer");
            root.append("g").attr("class", "nodes-layer");

            const zoomBehavior = d3
                .zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.4, 2.5])
                .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
                    root.attr("transform", event.transform.toString());
                });

            svg.call(zoomBehavior);
            svg.on("dblclick.zoom", null);
            zoomBehaviorRef.current = zoomBehavior;
        }

        // clip-paths dinámicos por cliente
        const clientClipDefs = svg.select<SVGGElement>("g.client-clip-defs");
        clientClipDefs.selectAll("clipPath").remove();
        clients.forEach((client) => {
            clientClipDefs
                .append("clipPath")
                .attr("id", `clip-${client.id}`)
                .append("circle")
                .attr("r", 20);
        });

        // --- Construcción de nodos y enlaces ------------------------------------
        const nodes: GraphNode[] = [
            { ...central, type: "company" },
            ...clients.map((c): GraphNode => ({ ...c, type: "client", power: 0, efficiency: 0 })),
        ];

        const activeClientData = selectedClientId
            ? clients.find((c) => c.id === selectedClientId)
            : undefined;

        if (activeClientData?.contracts) {
            const contractNodes: GraphNode[] = activeClientData.contracts.map(
                (contract: DashboardContract): GraphNode => ({
                    id: contract.id,
                    name: contract.name,
                    status: contract.status,
                    profitability: contract.profitability,
                    notifications: contract.notifications,
                    type: "contract",
                    parentId: activeClientData.id,
                    health: contract.profitability ?? 50,
                    power: 0,
                    efficiency: 0,
                    logo: "/contract-icon.png",
                })
            );
            nodes.push(...contractNodes);
        }

        const links: GraphLink[] = clients.map((client) => ({
            id: `${central.id}-${client.id}`,
            source: central.id,
            target: client.id,
            type: "connection",
        }));

        if (activeClientData?.contracts) {
            const contractLinks: GraphLink[] = activeClientData.contracts.map(
                (contract: DashboardContract) => ({
                    id: `${activeClientData.id}-${contract.id}`,
                    source: activeClientData.id,
                    target: contract.id,
                    type: "contract",
                })
            );
            links.push(...contractLinks);
        }

        // --- Posicionamiento inicial ---------------------------------------------
        const centerX = width / 2;
        const centerY = height / 2;
        const clientRadius = Math.min(width, height) * 0.25;

        clients.forEach((client, index) => {
            const angle = (index / clients.length) * 2 * Math.PI;
            const clientNode = nodes.find((n) => n.id === client.id);
            if (clientNode) {
                clientNode.x = centerX + Math.cos(angle) * clientRadius;
                clientNode.y = centerY + Math.sin(angle) * clientRadius;
            }
        });

        nodes
            .filter((n) => n.type === "contract")
            .forEach((contract) => {
                const parentClient = nodes.find((n) => n.id === contract.parentId);
                if (!parentClient || parentClient.x === undefined) return;

                const clientAngle = Math.atan2(
                    (parentClient.y ?? 0) - centerY,
                    parentClient.x - centerX
                );
                const siblingContracts = nodes.filter(
                    (n) => n.type === "contract" && n.parentId === contract.parentId
                );
                const contractIndex = siblingContracts.indexOf(contract);
                const totalContracts = siblingContracts.length;

                let contractAngle = clientAngle;
                if (totalContracts > 1) {
                    const angleSpread = Math.PI / 4;
                    const angleStep = angleSpread / Math.max(totalContracts - 1, 1);
                    contractAngle =
                        clientAngle - angleSpread / 2 + contractIndex * angleStep;
                }

                const contractDistance = clientRadius + 180;
                contract.x = centerX + Math.cos(contractAngle) * contractDistance;
                contract.y = centerY + Math.sin(contractAngle) * contractDistance;
            });

        const centralNode = nodes.find((n) => n.type === "company");
        if (centralNode) {
            centralNode.x = centerX;
            centralNode.y = centerY;
        }

        // --- Simulación --------------------------------------------------------
        const simulation = d3
            .forceSimulation<GraphNode>(nodes)
            .force(
                "link",
                d3
                    .forceLink<GraphNode, GraphLink>(links)
                    .id((d) => d.id)
                    .distance((d) => (d.type === "contract" ? 150 : 200))
                    .strength(0.8)
            )
            .force(
                "charge",
                d3.forceManyBody<GraphNode>().strength((d) => {
                    if (d.type === "company") return -800;
                    if (d.type === "client") return -400;
                    return -250;
                })
            )
            .force("center", d3.forceCenter(centerX, centerY))
            .force(
                "collision",
                d3
                    .forceCollide<GraphNode>()
                    .radius((d) => NODE_RADIUS[d.type] + 15)
                    .strength(0.9)
            )
            .alpha(0.5)
            .alphaDecay(0.02);

        // --- Enlaces (join real: enter/update/exit) -------------------------------
        const linksLayer = root.select<SVGGElement>("g.links-layer");
        const linkSelection = linksLayer
            .selectAll<SVGLineElement, GraphLink>("line.link")
            .data(links, (d) => d.id);

        linkSelection
            .exit<GraphLink>()
            .filter((d) => d.type === "contract")
            .transition()
            .duration(400)
            .style("opacity", 0)
            .remove();

        linkSelection
            .exit<GraphLink>()
            .filter((d) => d.type !== "contract")
            .remove();

        const linkEnter = linkSelection
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", (d) => (d.type === "contract" ? "#ffaa00" : "#00d4ff"))
            .attr("stroke-width", (d) => (d.type === "contract" ? 2 : 1))
            .attr("stroke-dasharray", (d) => (d.type === "contract" ? "5,5" : "none"))
            .style("opacity", 0);

        linkEnter
            .transition()
            .duration(400)
            .style("opacity", (d) => (d.type === "contract" ? 0.8 : 0.6));

        const link = linkEnter.merge(linkSelection);

        // --- Nodos (join real: enter/update/exit) ---------------------------------
        const nodesLayer = root.select<SVGGElement>("g.nodes-layer");
        const nodeSelection = nodesLayer
            .selectAll<SVGGElement, GraphNode>("g.node")
            .data(nodes, (d) => d.id);

        const nodeExit = nodeSelection.exit<GraphNode>();

        nodeExit
            .filter((d) => d.type === "contract")
            .transition()
            .duration(600)
            .ease(d3.easeCubicInOut)
            .style("opacity", 0)
            .attrTween("transform", (d) => {
                const parentNode = nodes.find((n) => n.id === d.parentId);
                const currentX = d.x ?? 0;
                const currentY = d.y ?? 0;

                const target = parentNode?.x !== undefined
                    ? { x: parentNode.x, y: parentNode.y ?? currentY }
                    : { x: centerX, y: centerY };

                return (t: number) => {
                    const x = currentX + (target.x - currentX) * t;
                    const y = currentY + (target.y - currentY) * t;
                    const scale = 1 - t * 0.9;
                    return `translate(${x}, ${y}) scale(${scale})`;
                };
            })
            .remove();

        nodeExit.filter((d) => d.type !== "contract").remove();

        const dragBehavior = d3
            .drag<SVGGElement, GraphNode>()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x ?? 0;
                d.fy = d.y ?? 0;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        // --- Handlers de interacción (click / hover) -------------------------------
        const handleNodeClick = function (
            this: SVGGElement,
            event: MouseEvent,
            d: GraphNode
        ) {
            event.stopPropagation();
            const group = d3.select<SVGGElement, GraphNode>(this);
            const color =
                d.type === "contract"
                    ? getContractStatusColor(d.status ?? "suspended")
                    : "#00d4ff";
            spawnClickRipple(group, color, NODE_RADIUS[d.type]);

            if (d.type === "company") {
                playConsoleTone(isControlPanelOpen ? "deselect" : "select");
                setSelectedClientId(null);
                setSelectedContractId(null);
                setIsControlPanelOpen((isOpen) => !isOpen);
                resetFocus();
                return;
            }

            if (d.type === "client") {
                const isSame = selectedClientId === d.id;
                playConsoleTone(isSame ? "deselect" : "select");
                setSelectedContractId(null);
                setSelectedClientId(isSame ? null : d.id);
                setIsControlPanelOpen(true);
                if (!isSame && d.x !== undefined && d.y !== undefined) {
                    focusOnPoint(d.x, d.y, 1.5);
                } else {
                    resetFocus();
                }
                return;
            }

            // contract
            const isSame = selectedContractId === d.id;
            playConsoleTone(isSame ? "deselect" : "select");
            setSelectedContractId(isSame ? null : d.id);
            setIsControlPanelOpen(true);
            if (!isSame && d.x !== undefined && d.y !== undefined) {
                focusOnPoint(d.x, d.y, 2);
            }
        };

        const handleNodeEnter = function (
            this: SVGGElement,
            event: MouseEvent,
            d: GraphNode
        ) {
            d3.select(this)
                .select("circle.node-hitbox")
                .transition()
                .duration(150)
                .attr("r", NODE_RADIUS[d.type] + 6);

            const rect = containerRef.current?.getBoundingClientRect();
            const subtitle =
                d.type === "contract"
                    ? `${getContractStatusText(d.status ?? "suspended")} · ${d.profitability == null ? "Rentabilidad no disponible" : `${d.profitability}% rentabilidad`}`
                    : d.type === "client"
                        ? `${d.archived ? "Archivado · " : ""}Salud: ${d.health ?? 0}%`
                        : `Eficiencia: ${d.efficiency ?? 0}%`;

            setTooltip({
                x: rect ? event.clientX - rect.left : event.clientX,
                y: rect ? event.clientY - rect.top : event.clientY,
                title: d.name ?? d.id,
                subtitle,
                accent:
                    d.type === "contract"
                        ? getContractStatusColor(d.status ?? "suspended")
                        : "#00d4ff",
            });
        };

        const handleNodeMove = (event: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            setTooltip((prev) =>
                prev
                    ? {
                          ...prev,
                          x: rect ? event.clientX - rect.left : event.clientX,
                          y: rect ? event.clientY - rect.top : event.clientY,
                      }
                    : prev
            );
        };

        const handleNodeLeave = function (this: SVGGElement, _event: MouseEvent, d: GraphNode) {
            d3.select(this)
                .select("circle.node-hitbox")
                .transition()
                .duration(150)
                .attr("r", NODE_RADIUS[d.type]);
            setTooltip(null);
        };

        const nodeEnter = nodeSelection
            .enter()
            .append("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .style("opacity", 0)
            .call(dragBehavior)
            .on("click", handleNodeClick)
            .on("mouseenter", handleNodeEnter)
            .on("mousemove", handleNodeMove)
            .on("mouseleave", handleNodeLeave);

        nodeEnter.transition().duration(400).style("opacity", 1);

        const node = nodeEnter.merge(nodeSelection);

        // hitbox invisible más grande para hover/click cómodo + efecto de escala
        nodeEnter
            .append("circle")
            .attr("class", "node-hitbox")
            .attr("r", (d) => NODE_RADIUS[d.type])
            .attr("fill", "transparent");

        nodeEnter
            .append("circle")
            .attr("class", "node-body")
            .attr("r", (d) => NODE_RADIUS[d.type])
            .attr("fill", (d) => {
                if (d.type === "company") return "#1a1a2e";
                if (d.type === "contract") return "#2a2a3e";
                return "#16213e";
            })
            .attr("stroke", (d) => (d.type === "contract" ? "#ffaa00" : "#00d4ff"))
            .attr("stroke-width", (d) => (d.type === "contract" ? 1 : 2))
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "client")
            .append("circle")
            .attr("class", "client-health-ring")
            .attr("r", 35)
            .attr("fill", "none")
            .attr("stroke", (d) =>
                d.archived ? "#ffb547" : getHealthColor(d.health ?? 50)
            )
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", (d) =>
                d.archived
                    ? "4 5"
                    : `${((d.health ?? 50) / 100) * 220} 220`
            )
            .attr("opacity", 0.8)
            .style("pointer-events", "none");

        node
            .filter((d) => d.type === "client")
            .select<SVGCircleElement>("circle.client-health-ring")
            .attr("stroke", (d) =>
                d.archived ? "#ffb547" : getHealthColor(d.health ?? 50)
            )
            .attr("stroke-dasharray", (d) =>
                d.archived
                    ? "4 5"
                    : `${((d.health ?? 50) / 100) * 220} 220`
            );

        nodeEnter
            .filter((d) => d.type === "company")
            .append("circle")
            .attr("r", 45)
            .attr("fill", "none")
            .attr("stroke", (d) => getHealthColor(d.health ?? 80))
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", (d) => `${((d.health ?? 80) / 100) * 283} 283`)
            .attr("opacity", 0.8)
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "company")
            .append("image")
            .attr("href", "/clientes/yga-neon.png")
            .attr("x", -25)
            .attr("y", -25)
            .attr("width", 50)
            .attr("height", 50)
            .attr("clip-path", "url(#clip-central)")
            .attr("preserveAspectRatio", "xMidYMid slice")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "company")
            .append("circle")
            .attr("r", 25)
            .attr("fill", "none")
            .attr("stroke", "#00d4ff")
            .attr("stroke-width", 2)
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "client")
            .append("image")
            .attr("href", (d) => getClientImageSrc(d.logo) || null)
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", (d) => `url(#clip-${d.id})`)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .style("pointer-events", "none");

        nodeEnter
            .filter(
                (d) =>
                    d.type === "client" && !getClientImageSrc(d.logo)
            )
            .append("text")
            .text((d) => d.name?.trim().charAt(0).toUpperCase() || "?")
            .attr("text-anchor", "middle")
            .attr("dy", "6")
            .attr("fill", "#e6f7ff")
            .attr("font-size", "17px")
            .attr("font-weight", "700")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "client")
            .append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", "#00d4ff")
            .attr("stroke-width", 1)
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract")
            .append("foreignObject")
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("clip-path", "url(#clip-contract)")
            .style("pointer-events", "none")
            .html(
                `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#2a2a3e,#1a1a2e);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffaa00">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" fill="#00d4ff"/>
                    </svg>
                </div>`
            );

        nodeEnter
            .filter((d) => d.type === "contract")
            .append("circle")
            .attr("r", 20)
            .attr("fill", "none")
            .attr("stroke", "#ffaa00")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract")
            .append("circle")
            .attr("r", 35)
            .attr("fill", "none")
            .attr("stroke", (d) => getContractStatusColor(d.status ?? "suspended"))
            .attr("stroke-width", 3)
            .attr(
                "stroke-dasharray",
                (d) => `${(Math.max(0, Math.min(100, d.profitability ?? 50)) / 100) * 220} 220`
            )
            .attr("opacity", 0.8)
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract")
            .append("text")
            .text((d) => getContractStatusText(d.status ?? "suspended"))
            .attr("text-anchor", "middle")
            .attr("dy", "30")
            .attr("fill", (d) => getContractStatusColor(d.status ?? "suspended"))
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract")
            .append("text")
            .text((d) => d.profitability == null ? "N/D" : `${d.profitability}%`)
            .attr("text-anchor", "middle")
            .attr("dy", "42")
            .attr("fill", "#00d4ff")
            .attr("font-size", "7px")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract" && (d.notifications?.length ?? 0) > 0)
            .append("circle")
            .attr("r", 6)
            .attr("fill", "#ff4444")
            .attr("cx", 20)
            .attr("cy", -20)
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => d.type === "contract" && (d.notifications?.length ?? 0) > 0)
            .append("text")
            .text((d) => d.notifications?.length ?? 0)
            .attr("text-anchor", "middle")
            .attr("dy", "3")
            .attr("x", 20)
            .attr("y", -20)
            .attr("fill", "white")
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => (d.alerts?.length ?? 0) > 0)
            .append("circle")
            .attr("r", 8)
            .attr("cx", 25)
            .attr("cy", -25)
            .attr("fill", "#ff4444")
            .style("pointer-events", "none");

        nodeEnter
            .filter((d) => (d.alerts?.length ?? 0) > 0)
            .append("text")
            .text((d) => d.alerts?.length ?? 0)
            .attr("x", 25)
            .attr("y", -21)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .style("pointer-events", "none");

        // --- Anillo de escaneo LCARS para el nodo seleccionado ---------------------
        node.selectAll(".scan-ring").remove();
        node
            .filter((d) => d.id === selectedClientId || d.id === selectedContractId)
            .append("circle")
            .attr("class", "scan-ring")
            .attr("r", (d) => NODE_RADIUS[d.type] + 18)
            .attr("fill", "none")
            .attr("stroke", "#00ffff")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4 7")
            .attr("filter", "url(#lcars-glow)")
            .style("pointer-events", "none")
            .append("animateTransform")
            .attr("attributeName", "transform")
            .attr("type", "rotate")
            .attr("from", "0 0 0")
            .attr("to", "360 0 0")
            .attr("dur", "5s")
            .attr("repeatCount", "indefinite");

        // --- Tick de la simulación --------------------------------------------------
        simulation.on("tick", () => {
            link
                .attr("x1", (d) => resolveNode(d.source).x)
                .attr("y1", (d) => resolveNode(d.source).y)
                .attr("x2", (d) => resolveNode(d.target).x)
                .attr("y2", (d) => resolveNode(d.target).y);

            node.attr("transform", (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
        });

        simulation.alpha(0.3).restart();

        return () => {
            simulation.stop();
        };
    }, [
        dimensions,
        selectedClientId,
        selectedContractId,
        isControlPanelOpen,
        companyData,
        isCompanyLoading,
        clientPreferences,
        includeArchivedClients,
        focusOnPoint,
        resetFocus,
    ]);

    // ---- Estados de carga / error ---------------------------------------------
    if (isPreferencesError || isDashboardError) {
        return (
            <div className="home-panel">
                <div className="glass-panel">
                    <div className="error-container">
                        <h3>Error al cargar datos</h3>
                        <p>No se pudieron cargar las preferencias o los datos del dashboard</p>
                        <button onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isCompanyLoading) {
        return (
            <div className="home-panel">
                <div className="glass-panel">
                    <div className="loading-container mx-auto">
                        <div className="loading-spinner" />
                        <p>Cargando panel de control...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!companyData) {
        return (
            <div className="home-panel">
                <div className="glass-panel">
                    <div className="error-container">
                        <h3>Error al cargar datos</h3>
                        <p>No se pudieron cargar los datos del dashboard</p>
                        <button onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectContract = (contractId: string, clientId: string) => {
        playConsoleTone("select");
        setSelectedClientId(clientId);
        setSelectedContractId(contractId);
    };

    const selectClient = (clientId: string) => {
        playConsoleTone("select");
        setSelectedContractId(null);
        setSelectedClientId(clientId);
    };

    return (
        <div className="home-panel" ref={containerRef} style={{ position: "relative" }}>
            <div className="glass-panel">
                <div className="main-graph">
                    <svg ref={svgRef} className="graph-svg" />
                    {tooltip && (
                        <div
                            className="lcars-tooltip"
                            style={{
                                position: "absolute",
                                left: tooltip.x + 16,
                                top: tooltip.y + 16,
                                pointerEvents: "none",
                                background: "rgba(10, 10, 20, 0.92)",
                                border: `1px solid ${tooltip.accent}`,
                                borderRadius: 8,
                                padding: "8px 12px",
                                color: "#e6f7ff",
                                fontSize: 12,
                                fontFamily: "monospace",
                                boxShadow: `0 0 12px ${tooltip.accent}66`,
                                zIndex: 20,
                                maxWidth: 220,
                            }}
                        >
                            <div style={{ color: tooltip.accent, fontWeight: 700 }}>
                                {tooltip.title}
                            </div>
                            <div style={{ opacity: 0.85 }}>{tooltip.subtitle}</div>
                        </div>
                    )}
                </div>
                <ControlPanel
                    companyData={companyData}
                    selectedClientId={selectedClientId}
                    selectedContractId={selectedContractId}
                    includeArchivedClients={includeArchivedClients}
                    onToggleArchivedClients={setIncludeArchivedClients}
                    onClientStatusChanged={() => {
                        setSelectedClientId(null);
                        setSelectedContractId(null);
                    }}
                    isVisible={isControlPanelOpen}
                    onClose={() => setIsControlPanelOpen(false)}
                    selectClient={selectClient}
                    selectContract={selectContract}
                />
            </div>
        </div>
    );
}
