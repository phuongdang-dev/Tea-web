import { StatusCodes } from "http-status-codes"
import { spuService } from "~/services/spu.service"
import ApiError from "~/utils/ApiError"
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants"
import { slugify } from "~/utils/slugify"

const createNew = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            product_slug: slugify(req.body.product_name) + '' + `-${Date.now()}`
        }
        const newSpu = await spuService.createNew(data)
        res.status(StatusCodes.CREATED).json(newSpu)
    } catch (error) {
        next(error)
    }
}

const getAllSpu = async (req, res, next) => {
    try {
        let { page, itemsPerPage, search } = req.query
        if (!page) page = DEFAULT_PAGE

        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

        const spus = await spuService.getAllSpu(page, itemsPerPage, search)
        res.status(StatusCodes.OK).json(spus)
    } catch (error) {
        next(error)
    }
}

const getBySlug = async (req, res, next) => {
    try {
        let { slug } = req.params
        if (!slug) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Slug không tồn tại!")
        }

        const spus = await spuService.getBySlug(slug)
        res.status(StatusCodes.OK).json(spus)
    } catch (error) {
        next(error)
    }
}

const deleteById = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "ID sản phẩm không được để trống!")
        }

        const result = await spuService.deleteById(id)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

const updateById = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "ID sản phẩm không được để trống!")
        }

        const updatedProduct = await spuService.updateById(id, req.body)
        res.status(StatusCodes.OK).json(updatedProduct)
    } catch (error) {
        next(error)
    }
}

const getRelatedProducts = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { limit } = req.query

        if (!slug) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Slug sản phẩm không được để trống!")
        }

        const limitNumber = limit ? parseInt(limit) : 8
        if (limitNumber < 1 || limitNumber > 20) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Limit phải từ 1 đến 20!")
        }

        const relatedProducts = await spuService.getRelatedProductsBySlug(slug, limitNumber)
        res.status(StatusCodes.OK).json(relatedProducts)
    } catch (error) {
        next(error)
    }
}

const getByCategoryId = async (req, res, next) => {
    try {
        const { categoryId } = req.params
        let { page, itemsPerPage, search } = req.query
        if (!page) page = DEFAULT_PAGE

        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

        const spus = await spuService.getAllSpuByCategoryId(categoryId, page, itemsPerPage, search)
        res.status(StatusCodes.OK).json(spus)
    } catch (error) {
        next(error)
    }
}

export const spuController = {
    createNew,
    getAllSpu,
    getBySlug,
    deleteById,
    updateById,
    getRelatedProducts,
    getByCategoryId
}