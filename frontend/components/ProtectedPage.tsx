"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/app/loginContext';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
    const { isLogin } = useLogin();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("isLogin:", isLogin);

        // Only redirect if `isLogin` is determined
        if (typeof isLogin !== 'undefined') {
            if (!isLogin) {
                router.push('/login');
            } else {
                setLoading(false); // If logged in, set loading to false
            }
        }
    }, [isLogin, router]);

    if (loading) {
        return <div>Loading...</div>; // Show loading spinner or message while checking login status
    }

    return (
        <>
            {children}
        </>
    );
}
