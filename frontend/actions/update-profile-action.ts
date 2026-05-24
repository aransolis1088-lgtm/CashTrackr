"use server"

import getToken from "@/src/auth/token"
import { ErrorResponseSchema, SuccessScheme, ProfileFormSchema } from "@/src/schemas"
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate"

type ActionStateType = {
    errors: string[],
    success: string
}

export async function updateUser(prevState: ActionStateType, formData: FormData) {

    const profile = ProfileFormSchema.safeParse({
        email: formData.get('email'),
        name: formData.get('name')
    })

    if (!profile.success) {
        return {
            errors: profile.error.issues.map(error => error.message),
            success: ''
        }
    }

    const token = getToken();

    const url = `${process.env.API_URL}/auth/user`
    const req = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            email: profile.data.email,
            name: profile.data.name
        })
    })

    const json = await req.json()

    if (!req.ok) {
        const { error } = ErrorResponseSchema.parse(json)
        return {
            errors: [error],
            success: ''
        }
    }
    revalidatePath('/admin/profile/settings')
    const success = SuccessScheme.parse(json)
    return {
        errors: [],
        success
    }
}