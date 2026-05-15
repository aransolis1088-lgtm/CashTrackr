"use server"

import getToken from "@/src/auth/token"
import { Budget, DraftBudgetSchema, ErrorResponseSchema, SuccessScheme } from "@/src/schemas"
import { revalidatePath, revalidateTag } from "next/cache"
import { success } from "zod"

type ActionStateType = {
    errors: string[]
    success: string
}

export async function editBudget(budgetId: Budget['id'], prevState: ActionStateType, formData: FormData) {

    const budgetData = {
        name: formData.get('name'),
        amount: formData.get('amount')
    }

    const budget = DraftBudgetSchema.safeParse(budgetData)

    if (!budget.success) {
        return {
            errors: budget.error.issues.map(issue => issue.message),
            success: ''
        }
    }

    const token = getToken()
    const url = `${process.env.API_URL}/budgets/${budgetId}`

    const req = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: budget.data.name,
            amount: budget.data.amount
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
    //limpia la cache de la pagina de admin para que se vea reflejado el cambio, util para cambios que afectan a toda la pagina, como crear, editar o eliminar presupuestos
    //revalidatePath('/admin')

    //revalida la cache de los presupuestos para que se vea reflejado, unicamente peticiones que tengan este tag se veran afectadas
    revalidateTag('all-budgets')

    const success = SuccessScheme.parse(json)

    return {
        errors: [],
        success
    }
}