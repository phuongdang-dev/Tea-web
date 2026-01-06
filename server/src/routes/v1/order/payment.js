import { PayOS } from '@payos/node'
import express from 'express'
import { env } from '~/configs/environment'
import CompanyInfo from '~/models/company.info.model'
import Order from '~/models/order.model'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { sendEmail } from '~/utils/sendMail'
import { OrderPaidCompanyMail, OrderPaidCustomerMail } from '~/utils/format.send.email'

const router = express.Router()

const payOs = new PayOS({
    clientId: env.PAYOS_CLIENT_ID,
    apiKey: env.PAYOS_API_KEY,
    checksumKey: env.PAYOS_CHECKSUM_KEY,
});

router.post('/create-payment-link', async (req, res) => {
    try {
        const orderData = await Order.findById(req.body.orderId)

        if (!orderData) {
            return res.status(404).json({ message: 'Order not found' })
        }

        const order = {
            amount: orderData.order_checkout.total,
            description: `Payment ${orderData.order_trackingNumber}`,
            orderCode: Number(orderData.order_trackingNumber),
            returnUrl: `${env.BACK_END_URL}/api/v1/orders/payment/receive-hook`,
            cancelUrl: `${env.BACK_END_URL}/api/v1/orders/payment/receive-hook`
        }

        const paymentLink = await payOs.paymentRequests.create(order)

        return res.json({
            checkoutUrl: paymentLink.checkoutUrl
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})


router.get('/receive-hook', async (req, res) => {
    try {
        console.log(req.query)
        const status = req.query?.status
        const orderCode = req.query?.orderCode
        const code = req.query?.code
        const order = await Order.findOne({ order_trackingNumber: String(orderCode) })
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }
        if (code == '00' && status == 'PAID' && orderCode) {

            order.order_payment.status = 'paid'
            order.order_payment.paid_at = new Date()
            await order.save()

            const company = await CompanyInfo.findOne()

            const webName = 'ShanBu'
            const customerHtml = OrderPaidCustomerMail(webName, order)
            const companyHtml = OrderPaidCompanyMail(webName, order)

            if (order?.order_customer?.email) {
                await sendEmail(webName, order.order_customer.email, 'Thanh toán đơn hàng thành công', customerHtml)
                    .catch((e) => console.error(e))
            }
            if (company?.company_email) {
                await sendEmail(webName, company.company_email, `Khách hàng đã thanh toán đơn #${order.order_trackingNumber}`, companyHtml)
                    .catch((e) => console.error(e))
            }
            res.redirect(`${WEBSITE_DOMAIN}/order/${order._id}/payment-success`)
        } else {
            res.redirect(`${WEBSITE_DOMAIN}/order/${order._id}/payment-failed`)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

export const orderPaymentRoutes = router
