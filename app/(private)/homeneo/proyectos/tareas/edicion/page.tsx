'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import EditTask from '@/app/components/EditTask';

function PageContent() {
    const params = useSearchParams();
    const router = useRouter();

    return (
        <main className="p-6 mt-8 h-screen overflow-y-scroll">
            <EditTask params={params} router={router} />
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PageContent />
        </Suspense>
    )
}
