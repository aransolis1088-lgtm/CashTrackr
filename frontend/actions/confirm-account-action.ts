"use server"

import { ErrorResponseSchema, SuccessScheme, TokenScheme } from "@/src/schemas"
import { success } from "zod"

type ActionStateType = {
    errors: string[],
    success: string
}

export async function confirmAccount(token: string, prevState: ActionStateType) {

    const confirmToken = TokenScheme.safeParse(token)

    if (!confirmToken.success) {
        return {
            errors: confirmToken.error.issues.map(issue => issue.message),
            success: ''
        }
    }


    //Confirmar el usuario
    const url = `${process.env.API_URL}/auth/confirm-account`
    const req = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: confirmToken.data
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

    const success = SuccessScheme.parse(json)
    return {
        errors: [],
        success
    }
}  