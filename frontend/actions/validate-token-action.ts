"use server"

import { error } from "console"
import { success } from "zod"

type ActionStateType = {
    errors: string[],
    success: string
}

export async function validateToken(token: string, prevState: ActionStateType) {
    return {
        errors: [],
        success: ''
    }
}