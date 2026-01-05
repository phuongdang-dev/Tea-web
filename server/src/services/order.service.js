import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import Order, { ORDER_STATUS, PAYMENT_STATUS } from "~/models/order.model"
import { discountService } from "./discount.service"
import { shipService } from "./ship.service"

const createOrder = async (orderData) => {
    try {
        const {
            customer_info,
            cart_items,
            discount_code,
            shipping_address,
            payment_method,
            user_id = null
        } = orderData

        // Validate cart items
        if (!cart_items || cart_items.length === 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty')
        }

        // Calculate subtotal
        const subtotal = cart_items.reduce((total, item) => {
            const itemPrice = item.attribute ? item.attribute.price : item.price
            return total + (itemPrice * item.quantity)
        }, 0)

        // Validate and apply discount if provided
        let discountInfo = {
            discount_id: null,
            discount_code: '',
            discount_name: '',
            discount_type: null,
            discount_value: 0,
            discount_amount: 0
        }

        if (discount_code) {
            try {
                const discountResult = await discountService.validateDiscountCode(
                    discount_code,
                    user_id,
                    subtotal
                )

                if (discountResult.valid) {
                    discountInfo = {
                        discount_id: discountResult.discount.id,
                        discount_code: discountResult.discount.code,
                        discount_name: discountResult.discount.name,
                        discount_type: discountResult.discount.discount_type,
                        discount_value: discountResult.discount.discount_value,
                        discount_amount: discountResult.discount.discount_amount
                    }
                }
            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid discount code: ${error.message}`)
            }
        }

        // Calculate shipping fee
        const subtotalAfterDiscount = subtotal - discountInfo.discount_amount
        const shippingResult = await shipService.calculateShippingFee(subtotalAfterDiscount)

        // Calculate final total
        const total = subtotalAfterDiscount + shippingResult.shippingFee

        // Generate tracking number
        const trackingNumber = await Order.generateTrackingNumber()

        // Prepare order products
        const orderProducts = cart_items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_slug: item.slug,
            product_image: item.image,
            product_price: item.attribute ? item.attribute.price : item.price,
            quantity: item.quantity,
            total_price: (item.attribute ? item.attribute.price : item.price) * item.quantity,
            product_attribute: item.attribute ? {
                name: item.attribute.name,
                unit: item.attribute.unit,
                price: item.attribute.price
            } : {}
        }))

        // Create order object
        const newOrder = new Order({
            order_userId: user_id,
            order_customer: {
                name: customer_info.name,
                phone: customer_info.phone,
                email: customer_info.email,
                address: customer_info.address,
                note: customer_info.note || ''
            },
            order_checkout: {
                subtotal: subtotal,
                discount_amount: discountInfo.discount_amount,
                shipping_fee: shippingResult.shippingFee,
                total: total
            },
            order_discount: discountInfo,
            order_shipping: {
                province: {
                    code: shipping_address?.province?.code || '',
                    name: shipping_address?.province?.name || ''
                },
                district: {
                    code: shipping_address?.district?.code || '',
                    name: shipping_address?.district?.name || ''
                },
                ward: {
                    code: shipping_address?.ward?.code || '',
                    name: shipping_address?.ward?.name || ''
                },
                street: shipping_address?.street || '',
                full_address: shipping_address?.full_address || customer_info.address
            },
            order_payment: {
                method: payment_method,
                status: PAYMENT_STATUS.PENDING
            },
            order_products: orderProducts,
            order_trackingNumber: trackingNumber,
            order_status: ORDER_STATUS.PENDING,
            status_history: [{
                status: ORDER_STATUS.PENDING,
                note: 'Order created',
                updated_at: new Date()
            }]
        })

        // Save order
        const savedOrder = await newOrder.save()

        if (payment_method === "bank_transfer") {


        }

        // Use discount if applied
        if (discountInfo.discount_id) {
            try {
                await discountService.useDiscount(discountInfo.discount_id, user_id, savedOrder._id)
            } catch (error) {
                console.error('Error using discount:', error)
                // Don't fail the order creation, just log the error
            }
        }

        return savedOrder

    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}



const getOrderById = async (orderId) => {
    try {
        const order = await Order.findById(orderId)
            .populate('order_userId', 'usr_name usr_email')
            .populate('order_discount.discount_id')

        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
        }

        return order
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

const getOrderByTrackingNumber = async (trackingNumber) => {
    try {
        const order = await Order.findOne({ order_trackingNumber: trackingNumber })
            .populate('order_userId', 'usr_name usr_email')
            .populate('order_discount.discount_id')

        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
        }

        return order
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

const getUserOrders = async (userId, filters = {}) => {
    try {
        const { page = 1, limit = 10, status } = filters

        const query = { order_userId: userId }
        if (status) {
            query.order_status = status
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('order_discount.discount_id')

        const total = await Order.countDocuments(query)

        return {
            orders,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_orders: total,
                has_next: page < Math.ceil(total / limit),
                has_prev: page > 1
            }
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

const updateOrderStatus = async (orderId, newStatus, note = '', updatedBy = null) => {
    try {
        const order = await Order.findById(orderId)

        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
        }

        // Allow free transitions but ensure the new status is valid
        if (!Object.values(ORDER_STATUS).includes(newStatus)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                `Invalid status: ${newStatus}`
            )
        }

        // Idempotent: if status is unchanged, return current order without modifying history
        if (order.order_status === newStatus) {
            return order
        }

        order.order_status = newStatus
        order.status_history.push({
            status: newStatus,
            note: note,
            updated_by: updatedBy,
            updated_at: new Date()
        })

        // Set delivery date if delivered
        if (newStatus === ORDER_STATUS.DELIVERED) {
            order.actual_delivery = new Date()
        }

        const updatedOrder = await order.save()
        return updatedOrder

    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

const getAllOrders = async (filters = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            search,
            start_date,
            end_date,
            sort_by = 'createdAt',
            sort_order = 'desc'
        } = filters

        const query = {}

        if (status) {
            query.order_status = status
        }

        if (search) {
            query.$or = [
                { order_trackingNumber: { $regex: search, $options: 'i' } },
                { 'order_customer.name': { $regex: search, $options: 'i' } },
                { 'order_customer.email': { $regex: search, $options: 'i' } },
                { 'order_customer.phone': { $regex: search, $options: 'i' } }
            ]
        }

        if (start_date || end_date) {
            query.createdAt = {}
            if (start_date) query.createdAt.$gte = new Date(start_date)
            if (end_date) query.createdAt.$lte = new Date(end_date)
        }

        const sortOptions = {}
        sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1

        const orders = await Order.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('order_userId', 'usr_name usr_email')
            .populate('order_discount.discount_id')

        const total = await Order.countDocuments(query)

        return {
            orders,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_orders: total,
                has_next: page < Math.ceil(total / limit),
                has_prev: page > 1
            }
        }
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

// Track order by tracking number or phone (public API)
const trackOrder = async ({ trackingNumber, phone }) => {
    try {
        let query = {}
        let isMultipleSearch = false

        if (trackingNumber) {
            query.order_trackingNumber = trackingNumber
        } else if (phone) {
            query['order_customer.phone'] = phone
            isMultipleSearch = true // Phone search returns multiple orders
        } else {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Tracking number or phone is required')
        }

        console.log('🔍 Track Order Service - Query:', query)
        console.log('🔍 Track Order Service - Multiple search:', isMultipleSearch)

        if (isMultipleSearch) {
            // For phone search, return all orders sorted by newest first
            const orders = await Order.find(query)
                .select('-__v -updatedAt')
                .sort({ createdAt: -1 })
                .lean()

            console.log('🔍 Track Order Service - Found orders:', orders.length)
            return { orders, isMultiple: true }
        } else {
            // For tracking number search, return single order
            const order = await Order.findOne(query)
                .select('-__v -updatedAt')
                .lean()

            console.log('🔍 Track Order Service - Found order:', !!order)

            if (!order) {
                return null
            }

            return { order, isMultiple: false }
        }
    } catch (error) {
        console.error('Track order error:', error)
        throw error
    }
}

// Get customers list with spending statistics (admin only)
const getCustomers = async (filters = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort_by = 'total_spent',
            sort_order = 'desc'
        } = filters

        console.log('🔍 Get Customers - Filters:', filters)

        const skip = (page - 1) * limit

        // Build aggregation pipeline
        const pipeline = [
            // Group by customer phone to aggregate data
            {
                $group: {
                    _id: '$order_customer.phone',
                    customer_name: { $first: '$order_customer.name' },
                    customer_phone: { $first: '$order_customer.phone' },
                    customer_email: { $first: '$order_customer.email' },
                    customer_address: { $first: '$order_customer.address' },
                    total_orders: { $sum: 1 },
                    total_spent: { $sum: '$order_checkout.total' },
                    last_order_date: { $max: '$createdAt' },
                    first_order_date: { $min: '$createdAt' },
                    order_statuses: { $push: '$order_status' }
                }
            },
            // Add computed fields
            {
                $addFields: {
                    average_order_value: {
                        $cond: {
                            if: { $gt: ['$total_orders', 0] },
                            then: { $divide: ['$total_spent', '$total_orders'] },
                            else: 0
                        }
                    },
                    completed_orders: {
                        $size: {
                            $filter: {
                                input: '$order_statuses',
                                cond: { $eq: ['$$this', 'delivered'] }
                            }
                        }
                    }
                }
            }
        ]

        console.log('🔍 Get Customers - Base pipeline created')

        // Add search filter if provided
        if (search && search.trim()) {
            pipeline.push({
                $match: {
                    $or: [
                        { customer_name: { $regex: search.trim(), $options: 'i' } },
                        { customer_phone: { $regex: search.trim(), $options: 'i' } },
                        { customer_email: { $regex: search.trim(), $options: 'i' } }
                    ]
                }
            })
            console.log('🔍 Get Customers - Search filter added:', search)
        }

        // Add sorting
        const sortField = sort_by === 'total_spent' ? 'total_spent' :
            sort_by === 'total_orders' ? 'total_orders' :
                sort_by === 'last_order_date' ? 'last_order_date' :
                    sort_by === 'customer_name' ? 'customer_name' : 'total_spent'

        const sortDirection = sort_order === 'asc' ? 1 : -1
        pipeline.push({ $sort: { [sortField]: sortDirection } })

        console.log('🔍 Get Customers - Sort added:', sortField, sortDirection)

        // Get total count for pagination
        const countPipeline = [...pipeline, { $count: 'total' }]
        const totalResult = await Order.aggregate(countPipeline)
        const total = totalResult.length > 0 ? totalResult[0].total : 0

        console.log('🔍 Get Customers - Total count:', total)

        // Add pagination
        pipeline.push({ $skip: skip }, { $limit: limit })

        // Execute aggregation
        const customers = await Order.aggregate(pipeline)

        console.log('🔍 Get Customers - Found customers:', customers.length)

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        return {
            customers,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_customers: total,
                has_next: hasNext,
                has_prev: hasPrev,
                limit
            }
        }
    } catch (error) {
        console.error('Get customers error:', error)
        throw error
    }
}

const createOrderByAdmin = async (orderData) => {
    try {
        const trackingNumber = await Order.generateTrackingNumber()
        const newData = {
            ...orderData,
            order_trackingNumber: trackingNumber
        }
        const order = await Order.create(newData)
        return order
    } catch (error) {
        console.error('Create order by admin error:', error)
        throw error
    }
}

const updatePaymentStatus = async (orderId, newStatus, updatedBy = null) => {
    try {
        const order = await Order.findById(orderId)

        if (!order) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
        }

        if (!Object.values(PAYMENT_STATUS).includes(newStatus)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid payment status: ${newStatus}`)
        }

        // Idempotent: no changes if same status
        if (order.order_payment?.status === newStatus) {
            return order
        }

        // Ensure order_payment object exists
        if (!order.order_payment) {
            order.order_payment = { method: 'cod', status: PAYMENT_STATUS.PENDING, paid_at: null }
        }

        order.order_payment.status = newStatus
        if (newStatus === PAYMENT_STATUS.PAID) {
            order.order_payment.paid_at = new Date()
        }

        // Push payment history
        if (!order.payment_history) order.payment_history = []
        order.payment_history.push({
            status: newStatus,
            updated_by: updatedBy,
            updated_at: new Date()
        })

        const updatedOrder = await order.save()
        return updatedOrder

    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
    }
}

export const orderService = {
    createOrder,
    getOrderById,
    getOrderByTrackingNumber,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getAllOrders,
    trackOrder,
    getCustomers,
    createOrderByAdmin
}
