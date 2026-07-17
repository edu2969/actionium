'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import EditTask from '@/app/components/EditTask';

function PageContent() {
    const params = useSearchParams();
    const router = useRouter();

    return (
        
            <EditTask params={params} router={router} />
        
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PageContent />
        </Suspense>
    )
}
