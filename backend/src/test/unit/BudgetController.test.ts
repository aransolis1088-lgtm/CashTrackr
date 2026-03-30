import { createRequest, createResponse} from 'node-mocks-http'
import { budgets } from "../mocks/budget"
import { BudgetController } from '../../controllers/BudgetController'

describe('BudgetController.getAll', () => {
    it('should retrieve 3 budgets', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id:3}
        })

        const res = createResponse()

        await BudgetController.getAll(req,res)

        console.log(res._getJSONData())
    })
})