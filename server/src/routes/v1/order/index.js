import express from 'express'
import { orderController } from '~/controllers/order.controller'
import { orderValidation } from '~/validations/order.validation'
import { authMiddlewares } from '~/middlewares/authMiddlewares'
import { adminMiddlewares } from '~/middlewares/adminMiddlewares'
import { orderPaymentRoutes } from './payment'

const router = express.Router()

// Public routes - không cần authentication

/**
 * @route POST /api/v1/orders
 * @desc Tạo đơn hàng mới (guest checkout hoặc user đã đăng nhập)
 * @access Public
 * @body { customer_info, cart_items, discount_code?, shipping_address?, payment_method? }
 */
router.post('/',
    orderValidation.createOrder,
    orderController.createOrder
)


router.post('/admin',
    authMiddlewares.isAuthorized,
    orderController.createOrderByAdmin
)

/**
 * @route GET /api/v1/orders/tracking/:tracking_number
 * @desc Tra cứu đơn hàng theo mã tracking (public)
 * @access Public
 * @params { tracking_number }
 */
router.get('/tracking/:tracking_number',
    orderValidation.validateTrackingNumber,
    orderController.getOrderByTrackingNumber
)

/**
 * @route POST /api/v1/orders/track
 * @desc Tra cứu đơn hàng theo mã tracking hoặc số điện thoại (public)
 * @access Public
 * @body { trackingNumber?, phone? }
 */
router.post('/track',
    orderController.trackOrder
)

// Protected routes - cần authentication
router.use(authMiddlewares.isAuthorized)

/**
 * @route GET /api/v1/orders/my-orders
 * @desc Lấy danh sách đơn hàng của user hiện tại
 * @access Private (User)
 * @query { page?, limit?, status? }
 */
router.get('/my-orders',
    orderValidation.getOrders,
    orderController.getUserOrders
)

/**
 * @route GET /api/v1/orders/stats
 * @desc Lấy thống kê đơn hàng của user hiện tại
 * @access Private (User)
 */
router.get('/stats',
    orderController.getOrderStats
)

// Admin routes - cần authentication và admin privileges
router.use(adminMiddlewares.isAdminSimple)

/**
 * @route GET /api/v1/orders/customers
 * @desc Lấy danh sách khách hàng với thống kê chi tiêu (admin)
 * @access Private (Admin only)
 * @query { page?, limit?, search?, sort_by?, sort_order? }
 */
router.get('/customers',
    orderValidation.getCustomers,
    orderController.getCustomers
)

/**
 * @route GET /api/v1/orders
 * @desc Lấy danh sách tất cả đơn hàng (admin)
 * @access Private (Admin only)
 * @query { page?, limit?, status?, search?, start_date?, end_date?, sort_by?, sort_order? }
 */
router.get('/',
    orderValidation.getOrders,
    orderController.getAllOrders
)

/**
 * @route PUT /api/v1/orders/:id/status
 * @desc Cập nhật trạng thái đơn hàng (admin)
 * @access Private (Admin only)
 * @params { id }
 * @body { status, note? }
 */
router.put('/:id/status',
    orderValidation.validateObjectId,
    orderValidation.updateOrderStatus,
    orderController.updateOrderStatus
)


/**
 * @route PUT /api/v1/orders/:id/payment-status
 * @desc Cập nhật trạng thái thanh toán (admin)
 * @access Private (Admin only)
 * @params { id }
 * @body { status }
 */
router.put('/:id/payment-status',
    orderValidation.validateObjectId,
    orderController.updatePaymentStatus
)

/**
 * @route GET /api/v1/orders/:id
 * @desc Lấy chi tiết đơn hàng theo ID
 * @access Private (User/Admin)
 * @params { id }
 */
router.get('/:id',
    orderValidation.validateObjectId,
    orderController.getOrderById
)

router.use("/payment", orderPaymentRoutes)

export const orderRoutes = router
