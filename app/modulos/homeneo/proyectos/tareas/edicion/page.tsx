'use client'
import { useRouter, useSearchParams } from 'next/navigation';
import EditTask from '@/components/EditTask';

export default function Page() {
    const params = useSearchParams();
    const router = useRouter();

    return (
        
            <EditTask params={params} router={router} />
        
    );
}
