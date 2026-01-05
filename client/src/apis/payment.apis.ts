import axiosCustomize from "@/services/axios.customize"

export const createPaymentLink = async (orderId: string) => {
    const response = await axiosCustomize.post(`/orders/payment/create-payment-link`, {
        orderId
    });
    return response.data;
}