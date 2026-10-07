"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { ClientItemListType, UserFormType } from "@/lib/types";
import "./ContractEditor.css";

interface ContractEditorForm {
    title: string;
    clientId: string;
    vendorId: string;
    status: string;
    currency: string;
    netAmount: string;
    termsOfPayment: string;
}

interface ContractRecord {
    title?: string;
    clientId?: string | null;
    vendorId?: string | null;
    status?: number;
    currency?: string;
    netAmount?: number;
    termsOfPayment?: string;
}

const INITIAL_FORM: ContractEditorForm = {
    title: "",
    clientId: "",
    vendorId: "",
    status: "0",
    currency: "CLP",
    netAmount: "",
    termsOfPayment: "",
};

const CONTRACT_STATUSES = [
    { value: "0", label: "Borrador" },
    { value: "1", label: "Activo" },
    { value: "2", label: "Inactivo" },
    { value: "3", label: "Cerrado" },
    { value: "4", label: "Rechazado" },
];

function EdicionContratoContent() {
    const [clients, setClients] = useState<ClientItemListType[]>([]);
    const [vendors, setVendors] = useState<UserFormType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const params = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const contractId = params.get("_id");
    const selectedClientId = params.get("clientId") ?? "";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContractEditorForm>({
        defaultValues: INITIAL_FORM,
    });

    useEffect(() => {
        let isCurrent = true;

        async function loadFormData() {
            setIsLoading(true);
            setError(null);

            try {
                const [clientsResponse, usersResponse] = await Promise.all([
                    fetch("/api/clients"),
                    fetch("/api/users"),
                ]);

                if (!clientsResponse.ok || !usersResponse.ok) {
                    throw new Error("No se pudieron cargar clientes y vendedores.");
                }

                const [clientsData, usersData] = await Promise.all([
                    clientsResponse.json() as Promise<{
                        clients: ClientItemListType[];
                    }>,
                    usersResponse.json() as Promise<{
                        users: UserFormType[];
                    }>,
                ]);

                if (!isCurrent) return;
                setClients(clientsData.clients);
                setVendors(usersData.users);

                if (contractId) {
                    const contractResponse = await fetch(
                        `/api/contracts/${encodeURIComponent(contractId)}`
                    );
                    if (!contractResponse.ok) {
                        throw new Error("No se pudo cargar el contrato.");
                    }

                    const contractData = (await contractResponse.json()) as {
                        contract?: ContractRecord;
                    };
                    if (!contractData.contract) {
                        throw new Error("La respuesta no contiene el contrato.");
                    }

                    if (!isCurrent) return;
                    reset({
                        title: contractData.contract.title ?? "",
                        clientId: contractData.contract.clientId
                            ? contractData.contract.clientId
                            : "",
                        vendorId: contractData.contract.vendorId
                            ? contractData.contract.vendorId
                            : "",
                        status: String(contractData.contract.status ?? 0),
                        currency: contractData.contract.currency ?? "CLP",
                        netAmount: String(
                            contractData.contract.netAmount ?? 0
                        ),
                        termsOfPayment:
                            contractData.contract.termsOfPayment ?? "",
                    });
                } else {
                    reset({
                        ...INITIAL_FORM,
                        clientId: selectedClientId,
                    });
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Ocurrió un error al cargar el formulario."
                    );
                }
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        }

        void loadFormData();
        return () => {
            isCurrent = false;
        };
    }, [contractId, reset, selectedClientId]);

    const onSubmit: SubmitHandler<ContractEditorForm> = async (formData) => {
        setIsSaving(true);
        setError(null);

        const netAmount = Number(formData.netAmount);
        if (!Number.isFinite(netAmount) || netAmount < 0) {
            setError("Ingresa un monto neto válido.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(
                `/api/contracts${contractId ? `/${encodeURIComponent(contractId)}` : ""}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: formData.title.trim(),
                        clientId: formData.clientId,
                        vendorId: formData.vendorId || null,
                        status: Number(formData.status),
                        currency: formData.currency,
                        netAmount,
                        termsOfPayment: formData.termsOfPayment.trim(),
                    }),
                }
            );

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(
                    responseText || "No se pudo guardar el contrato."
                );
            }

            await queryClient.invalidateQueries({
                queryKey: ["panel-data"],
            });
            router.back();
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Ocurrió un error al guardar el contrato."
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <main className="contract-editor-page">
                <div className="contract-editor-frame" role="status">
                    Cargando formulario de contrato...
                </div>
            </main>
        );
    }

    return (
        <main className="contract-editor-page">
            <section
                aria-labelledby="contract-editor-title"
                className="contract-editor-frame"
            >
                <div className="contract-editor-content">
                    <header className="contract-editor-heading">
                        <p className="contract-editor-kicker">
                            Gestión de contratos
                        </p>
                        <h1 id="contract-editor-title">
                            {contractId ? "Editar contrato" : "Nuevo contrato"}
                        </h1>
                        <p>
                            Completa los datos del contrato y su relación
                            comercial.
                        </p>
                    </header>

                    {error && (
                        <p className="contract-editor-error" role="alert">
                            {error}
                        </p>
                    )}

                    <form
                        className="contract-editor-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <label className="contract-editor-field">
                            <span>Cliente *</span>
                            <select
                                {...register("clientId", {
                                    required: "Selecciona un cliente.",
                                })}
                                required
                            >
                                <option value="">Selecciona un cliente</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            {errors.clientId && (
                                <small>{errors.clientId.message}</small>
                            )}
                        </label>

                        <label className="contract-editor-field">
                            <span>Vendedor</span>
                            <select {...register("vendorId")}>
                                <option value="">Sin vendedor asignado</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="contract-editor-field contract-editor-field-wide">
                            <span>Título *</span>
                            <input
                                {...register("title", {
                                    required: "El título es obligatorio.",
                                    validate: (value) =>
                                        Boolean(value.trim()) ||
                                        "El título es obligatorio.",
                                })}
                                autoComplete="off"
                                placeholder="Nombre del contrato"
                                required
                            />
                            {errors.title && (
                                <small>{errors.title.message}</small>
                            )}
                        </label>

                        <label className="contract-editor-field">
                            <span>Estado *</span>
                            <select {...register("status", { required: true })}>
                                {CONTRACT_STATUSES.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="contract-editor-field">
                            <span>Moneda *</span>
                            <select
                                {...register("currency", { required: true })}
                            >
                                <option value="CLP">CLP</option>
                                <option value="USD">USD</option>
                            </select>
                        </label>

                        <label className="contract-editor-field">
                            <span>Monto neto *</span>
                            <input
                                {...register("netAmount", {
                                    required: "El monto neto es obligatorio.",
                                    validate: (value) =>
                                        (Number.isFinite(Number(value)) &&
                                            Number(value) >= 0) ||
                                        "Ingresa un monto válido.",
                                })}
                                inputMode="decimal"
                                min="0"
                                placeholder="0"
                                step="any"
                                type="number"
                            />
                            {errors.netAmount && (
                                <small>{errors.netAmount.message}</small>
                            )}
                        </label>

                        <label className="contract-editor-field">
                            <span>Plazo de pago *</span>
                            <input
                                {...register("termsOfPayment", {
                                    required: "El plazo de pago es obligatorio.",
                                    validate: (value) =>
                                        Boolean(value.trim()) ||
                                        "El plazo de pago es obligatorio.",
                                })}
                                placeholder="Ej. 30 días"
                                required
                            />
                            {errors.termsOfPayment && (
                                <small>
                                    {errors.termsOfPayment.message}
                                </small>
                            )}
                        </label>

                        <div className="contract-editor-actions">
                            <button
                                className="contract-editor-secondary-button"
                                disabled={isSaving}
                                onClick={() => router.back()}
                                type="button"
                            >
                                Volver
                            </button>
                            <button
                                className="contract-editor-primary-button"
                                disabled={isSaving || clients.length === 0}
                                type="submit"
                            >
                                {isSaving
                                    ? "Guardando..."
                                    : contractId
                                      ? "Guardar cambios"
                                      : "Crear contrato"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}

export default function EdicionContrato() {
    return (
        <Suspense
            fallback={
                <main className="contract-editor-page">
                    Cargando...
                </main>
            }
        >
            <EdicionContratoContent />
        </Suspense>
    );
}
