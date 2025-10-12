import { StatusCodes } from "http-status-codes"
import Category from "~/models/category.model"
import SPU from "~/models/spu.model"
import ApiError from "~/utils/ApiError"
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants"
import { slugify } from "~/utils/slugify"

const createNew = async (data) => {
    try {

        const newData = {
            product_name: data.product_name,
            product_description: data.product_description,
            product_images: data.product_images,
            product_basePrice: data.product_basePrice,
            product_attribute: data.product_attribute,
            product_category: data.product_category,
            product_slug: data.product_slug,
            product_thumb: data.product_thumb ? data.product_thumb : data.product_images[0],
            product_cover: data.product_cover ? data.product_cover : data.product_images[0],
            product_brewing: data.product_brewing,
            product_tea_category: data.product_tea_category,
            product_taste: data.product_taste,
            product_effects: data.product_effects,
            isPublished: data.isPublished
        }

        const newSpu = new SPU(newData)

        const savedSpu = await newSpu.save()
        return savedSpu
    } catch (error) {
        throw error
    }
}

const getAllSpu = async (page, itemsPerPage, search) => {
    try {
        const result = await SPU.aggregate([
            {
                $match: search
                    ? {
                        $or: [
                            { product_name: { $regex: search, $options: "i" } },
                            { product_description: { $regex: search, $options: "i" } },
                        ],
                    }
                    : {},
            },
            {
                $lookup: {
                    from: "Categories",
                    localField: "product_category",
                    foreignField: "_id",
                    as: "product_category",
                },
            },
            {
                $lookup: {
                    from: "Skus",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "skus",
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $facet: {
                    data: [
                        { $skip: (page - 1) * itemsPerPage },
                        { $limit: itemsPerPage },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ]).exec();

        const spus = result[0].data.map((spu) => {
            return {
                ...spu,
                product_category: spu.product_category[0] || null,
                skus: spu.skus || [],
            };
        });

        const count = result[0].totalCount[0]?.count || 0;

        return {
            total: count,
            page,
            size: spus.length,
            data: spus,
        };
    } catch (error) {
        throw error;
    }
};


const getBySlug = async (slug) => {
    try {
        const productExits = await SPU.find({ product_slug: slug })
        if (!productExits) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!")
        }
        const result = await SPU.aggregate([
            {
                $match: { product_slug: slug },
            },
            {
                $lookup: {
                    from: "Categories",
                    localField: "product_category",
                    foreignField: "_id",
                    as: "product_category",
                },
            },
            {
                $lookup: {
                    from: "Skus",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "skus",
                },
            }
        ]).exec();

        const spu = {
            ...result[0],
            product_category: result[0].product_category[0] || null,
            skus: result[0].skus || [],
        };

        return spu;
    } catch (error) {
        throw error;
    }
};

const deleteById = async (id) => {
    try {
        // Kiểm tra sản phẩm có tồn tại không
        const productExists = await SPU.findById(id)
        if (!productExists) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!")
        }

        // Xóa sản phẩm
        await SPU.findByIdAndDelete(id)

        return { message: "Sản phẩm đã được xóa thành công!" }
    } catch (error) {
        throw error
    }
}

const updateById = async (id, updateData) => {
    try {
        // Kiểm tra sản phẩm có tồn tại không
        const productExists = await SPU.findById(id)
        if (!productExists) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!")
        }

        // Nếu có cập nhật tên sản phẩm, tạo slug mới
        if (updateData.product_name) {
            updateData.product_slug = slugify(updateData.product_name) + '-' + Date.now()
        }

        // Cập nhật sản phẩm
        const updatedProduct = await SPU.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        return updatedProduct
    } catch (error) {
        throw error
    }
}

const getRelatedProductsBySlug = async (slug, limit = 8) => {
    try {
        // Tìm sản phẩm hiện tại dựa trên slug để lấy category
        const currentProduct = await SPU.findOne({ product_slug: slug })
        if (!currentProduct) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Sản phẩm không tồn tại!")
        }

        // Tìm các sản phẩm cùng category, loại trừ sản phẩm hiện tại
        const result = await SPU.aggregate([
            {
                $match: {
                    _id: { $ne: currentProduct._id },
                    isPublished: true,
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "Categories",
                    localField: "product_category",
                    foreignField: "_id",
                    as: "product_category"
                }
            },
            {
                $lookup: {
                    from: "Skus",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "skus"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
            }
        ]).exec()

        const relatedProducts = result.map((product) => {
            return {
                ...product,
                product_category: product.product_category[0] || null,
                skus: product.skus || []
            }
        })

        return {
            currentProduct: {
                _id: currentProduct._id,
                product_name: currentProduct.product_name,
                product_slug: currentProduct.product_slug
            },
            relatedProducts,
            total: relatedProducts.length
        }
    } catch (error) {
        throw error
    }
}

const getAllSpuByCategoryId = async (categoryId, page, itemsPerPage, search) => {
    try {

        const category = await Category.findOne({ category_slug: categoryId })
        const result = await SPU.aggregate([
            {
                $match: { product_category: category._id }
            },
            {
                $lookup: {
                    from: "Categories",
                    localField: "product_category",
                    foreignField: "_id",
                    as: "product_category"
                }
            },
            {
                $lookup: {
                    from: "Skus",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "skus"
                }
            }, {
                $sort: { createdAt: -1 }
            },
            {
                $facet: {
                    data: [
                        { $skip: (page - 1) * itemsPerPage },
                        { $limit: itemsPerPage },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },

        ]).exec()
        const spus = result[0].data.map((spu) => {
            return {
                ...spu,
                product_category: spu.product_category[0] || null,
                skus: spu.skus || [],
            };
        });
        const count = result[0].totalCount[0]?.count || 0;
        return {
            total: count,
            page,
            size: spus.length,
            data: spus,
        };
    } catch (error) {
        throw error
    }
}

export const spuService = {
    createNew,
    getAllSpu,
    getBySlug,
    deleteById,
    updateById,
    getRelatedProductsBySlug,
    getAllSpuByCategoryId
}