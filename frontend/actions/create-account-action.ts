"use server"

import { RegisterSchema } from "@/src/schemas"
import { error } from "console"

export async function register(formData: FormData) {
    const registerData = {
        email: formData.get('email'),
        name: formData.get('name'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation'),
    }

    //Validar
    const register = RegisterSchema.safeParse(registerData)

    const errors = register.error?.issues.map(error => error.message)

    console.log(errors)


    //Registrar Usuario
}