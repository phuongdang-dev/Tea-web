import { PayOS } from '@payos/node'
import express from 'express'
import { env } from '~/configs/environment'
import Order from '~/models/order.model'
import { WEBSITE_DOMAIN } from '~/utils/constants'

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
            returnUrl: `${WEBSITE_DOMAIN}/order/${orderData._id}/payment-success`,
            cancelUrl: `${WEBSITE_DOMAIN}/order/${orderData._id}/payment-cancel`
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


router.post('/receive-hook', async (req, res) => {
    try {
        console.log(req.body)
        // const orderData = await Order.findOne({ order_trackingNumber: req.body.orderCode })
        // if (!orderData) {
        //     return res.status(404).json({ message: 'Order not found' })
        // }
        // orderData.order_payment.status = req.body.status
        // await orderData.save()
        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

export const orderPaymentRoutes = router
