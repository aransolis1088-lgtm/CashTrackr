import { Router} from 'express'

const router = Router()

router.get('/', (req, res) => {
    console.log('Desde budgetRouter')
})

export default router