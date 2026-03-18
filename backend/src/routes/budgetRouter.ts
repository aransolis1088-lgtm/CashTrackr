import { Router } from 'express'
import { body, param } from 'express-validator'
import { BudgetController } from '../controllers/BudgetController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.get('/', BudgetController.getAll)

router.post('/',
    body('name')
        .notEmpty().withMessage('El nombre del presupuesto no puede ir vacio '),
    body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacia ')
        .isNumeric().withMessage('Cantidad no valida')
        .custom(value => value>0).withMessage('Presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.create)

router.get('/:id', 
    param('id').isInt().withMessage('ID no válido')
    .custom(value => value>0).withMessage('ID no valido'),
    handleInputErrors,
    BudgetController.getById
)
router.put('/:id', BudgetController.updateById)
router.delete('/:id', BudgetController.deleteById)



export default router