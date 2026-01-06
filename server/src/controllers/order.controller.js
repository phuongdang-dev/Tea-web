import { StatusCodes } from "http-status-codes"
import { orderService } from "~/services/order.service"
import { WEBSITE_DOMAIN } from "~/utils/constants"
import { OrderPlacedCustomerMail } from "~/utils/format.send.email"
import { sendEmail } from "~/utils/sendMail"

const createOrder = async (req, res, next) => {
    try {
        const { customer_info, cart_items, discount_code, shipping_address, payment_method } = req.body

        // Get user ID from JWT token if available (for logged-in users)
        const userId = req.jwtDecoded?._id || req.jwtDecoded?.userId || null

        const orderData = {
            customer_info,
            cart_items,
            discount_code,
            shipping_address,
            payment_method,
            user_id: userId
        }

        const newOrder = await orderService.createOrder(orderData)

        if (newOrder?.order_customer?.email) {
            const webName = 'ShanBu'
            const html = OrderPlacedCustomerMail(webName, WEBSITE_DOMAIN, newOrder)
            sendEmail(webName, newOrder.order_customer.email, `Xác nhận đặt hàng #${newOrder.order_trackingNumber}`, html)
                .catch((e) => console.error(e))
        }

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: newOrder._id,
                tracking_number: newOrder.order_trackingNumber,
                total: newOrder.order_checkout.total,
                status: newOrder.order_status
            }
        })
    } catch (error) {
        next(error)
    }
}

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params
        const order = await orderService.getOrderById(id)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        })
    } catch (error) {
        next(error)
    }
}

const getOrderByTrackingNumber = async (req, res, next) => {
    try {
        const { tracking_number } = req.params
        const order = await orderService.getOrderByTrackingNumber(tracking_number)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        })
    } catch (error) {
        next(error)
    }
}

const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?._id || req.jwtDecoded?.userId

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            })
        }

        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            status: req.query.status
        }

        const result = await orderService.getUserOrders(userId, filters)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        })
    } catch (error) {
        next(error)
    }
}

const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status, note } = req.body
        const updatedBy = req.jwtDecoded?._id || req.jwtDecoded?.userId

        const updatedOrder = await orderService.updateOrderStatus(id, status, note, updatedBy)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        })
    } catch (error) {
        next(error)
    }
}

const getAllOrders = async (req, res, next) => {
    try {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            status: req.query.status,
            search: req.query.search,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            sort_by: req.query.sort_by || 'createdAt',
            sort_order: req.query.sort_order || 'desc'
        }

        const result = await orderService.getAllOrders(filters)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        })
    } catch (error) {
        next(error)
    }
}

const getOrderStats = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded?._id || req.jwtDecoded?.userId

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            })
        }

        // Get order statistics for the user
        const stats = await orderService.getOrderStats(userId)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Order statistics retrieved successfully',
            data: stats
        })
    } catch (error) {
        next(error)
    }
}

// Public API - Track order by tracking number or phone (no authentication required)
const trackOrder = async (req, res, next) => {
    try {
        const { trackingNumber, phone } = req.body

        if (!trackingNumber && !phone) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Vui lòng cung cấp mã đơn hàng hoặc số điện thoại'
            })
        }

        const result = await orderService.trackOrder({ trackingNumber, phone })

        if (!result) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            })
        }

        // Helper function to format order data
        const formatOrderData = (order) => ({
            order_id: order._id,
            order_trackingNumber: order.order_trackingNumber,
            order_status: order.order_status,
            order_checkout: {
                subtotal: order.order_checkout.subtotal,
                shipping_fee: order.order_checkout.shipping_fee,
                discount_amount: order.order_checkout.discount_amount,
                total: order.order_checkout.total
            },
            customer_info: {
                name: order.order_customer.name,
                phone: order.order_customer.phone,
                email: order.order_customer.email,
                address: order.order_customer.address,
                note: order.order_customer.note
            },
            order_shipping: order.order_shipping,
            order_payment: {
                method: order.order_payment.method,
                status: order.order_payment.status
            },
            order_items: order.order_items,
            createdAt: order.createdAt
        })

        if (result.isMultiple) {
            // Multiple orders (phone search)
            const formattedOrders = result.orders.map(formatOrderData)


            res.status(StatusCodes.OK).json({
                success: true,
                message: `Tìm thấy ${result.orders.length} đơn hàng`,
                data: {
                    orders: formattedOrders,
                    isMultiple: true,
                    total: result.orders.length
                }
            })
        } else {
            // Single order (tracking number search)
            const formattedOrder = formatOrderData(result.order)


            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Tìm thấy thông tin đơn hàng',
                data: {
                    order: formattedOrder,
                    isMultiple: false
                }
            })
        }
    } catch (error) {
        next(error)
    }
}

// Admin API - Get customers list with spending statistics
const getCustomers = async (req, res, next) => {
    try {

        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search || '',
            sort_by: req.query.sort_by || 'total_spent',
            sort_order: req.query.sort_order || 'desc'
        }


        const result = await orderService.getCustomers(filters)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Customers retrieved successfully',
            data: result.customers,
            pagination: result.pagination
        })
    } catch (error) {
        console.error('🔍 Get Customers Controller - Error:', error)
        next(error)
    }
}

const createOrderByAdmin = async (req, res, next) => {
    try {
        const newOrder = await orderService.createOrderByAdmin(req.body)
        res.status(StatusCodes.CREATED).json(newOrder)
    } catch (error) {
        next(error)
    }
}

const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status, payment_status } = req.body
        const updatedBy = req.jwtDecoded?._id || req.jwtDecoded?.userId

        const newStatus = payment_status || status
        const updatedOrder = await orderService.updatePaymentStatus(id, newStatus, updatedBy)

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Payment status updated successfully',
            data: updatedOrder
        })
    } catch (error) {
        next(error)
    }
}

export const orderController = {
    createOrder,
    getOrderById,
    getOrderByTrackingNumber,
    getUserOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getAllOrders,
    getOrderStats,
    trackOrder,
    getCustomers,
    createOrderByAdmin
}
