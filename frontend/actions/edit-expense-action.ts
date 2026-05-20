"use server"

import getToken from "@/src/auth/token"
import { Budget, DraftExpenseSchema, ErrorResponseSchema, Expense, SuccessScheme } from "@/src/schemas"
import { revalidatePath } from "next/cache"

type BudgetAndExpenseIdType = {
    budgetId: Budget['id'],
    expenseId: Expense['id']
}

type ActionStateTyoe = {
    errors: string[],
    success: string
}

export default async function editExpense({ budgetId, expenseId }: BudgetAndExpenseIdType, prevState: ActionStateTyoe, formData: FormData) {

    const expense = DraftExpenseSchema.safeParse({
        name: formData.get('name'),
        amount: formData.get('amount')
    })

    if (!expense.success) {
        return {
            errors: expense.error.issues.map(e => e.message),
            success: ''
        }
    }
    const token = getToken();
    const url = `${process.env.API_URL}//budgets/${budgetId}/expenses/${expenseId}`
    const req = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: expense.data.name,
            amount: expense.data.amount
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

    revalidatePath(`/admin/budgets/${budgetId}`)
    return {
        errors: [],
        success
    }
}