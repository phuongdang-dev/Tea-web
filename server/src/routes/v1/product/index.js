import express from 'express'
import { spuController } from '~/controllers/spu.controller'
import { authMiddlewares } from '~/middlewares/authMiddlewares'

const router = express.Router()

router.route('/')
    .post(authMiddlewares.isAuthorized, spuController.createNew)
    .get(spuController.getAllSpu)

router.route('/:id')
    .put(authMiddlewares.isAuthorized, spuController.updateById)
    .delete(authMiddlewares.isAuthorized, spuController.deleteById)

router.route('/category/:categoryId')
    .get(spuController.getByCategoryId)

router.route('/related/:slug')
    .get(spuController.getRelatedProducts)

router.route('/:slug')
    .get(spuController.getBySlug)

export const productRoutes = router