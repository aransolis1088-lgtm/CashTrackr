import ForgotPasswordForm from '@/components/auth/forgotPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "CashTrackr - Olvidé mi Password",
    description: "CashTrackr - Olvidé mi Password",
}

export default function ForgotPasswordPage() {

    return (
        <>
            <h1 className="font-black text-6xl text-purple-950">¿Olvidaste tu contraseña?</h1>
            <p className="text-3xl font-bold">aquí puedes <span className="text-amber-500">reestablecerla</span></p>

            <ForgotPasswordForm />

        </>
    )
}
