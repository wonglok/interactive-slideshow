'use client'

import { AdminSignupForm } from '@/components/admin-signup-form'
import { Loader, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
    //

    // let [status, setStatus] = useState('loading')
    // useEffect(() => {
    //     TRPCService.api.auth
    //         .checkCanRegisterAdmin({})
    //         .then((data: any) => {
    //             if (data?.canRegister) {
    //                 setStatus(`register-first-user`)
    //                 //
    //             } else {
    //                 setStatus(`has-admin-can-redirect-to-dashboard`)
    //                 //
    //             }
    //         })
    //         .catch((r: any) => {
    //             console.log(r)
    //             // error
    //         })
    // }, [])

    return (
        <>
            {/* {status === 'loading' && (
                <>
                    <div className='w-full h-full flex justify-center items-center'>
                        <div>
                            <Loader className=' animate-spin'> </Loader>
                        </div>
                    </div>
                </>
            )}

            {status === 'register-first-user' && (
                <>
                    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
                        <div className='w-full max-w-sm md:max-w-4xl'>
                            <AdminSignupForm />
                        </div>
                    </div>
                </>
            )} */}
        </>
    )
}
