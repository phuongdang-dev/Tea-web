import BlogRoutes from "@/pages/public/blog"
import CartPage from "@/pages/public/cart"
import CheckoutPage from "@/pages/public/checkout"
import OrderSuccessPage from "@/pages/public/order-success"
import OrderTrackingPage from "@/pages/public/order-tracking"
import LandingPage from "@/pages/public/landing-page/Index"
import { TeaProductDetail } from "@/pages/public/product-detail"
import { Products } from "@/pages/public/products"
import AddressTest from "@/pages/debug/AddressTest"
import { Router } from "@/types/router"
import PaymentSuccess from "@/pages/public/payment/payment-success"
import PaymentCancel from "@/pages/public/payment/payment-cancel"

export const publicRouter: Router[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/:slug",
    element: <Products />,
  },
  {
    path: "/san-pham/:slug",
    element: <TeaProductDetail />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/gio-hang",
    element: <CartPage />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/order-success",
    element: <OrderSuccessPage />,
  },
  {
    path: "/order-tracking",
    element: <OrderTrackingPage />,
  },
  {
    path: "/tra-cuu-don-hang",
    element: <OrderTrackingPage />,
  },
  {
    path: "/debug/address",
    element: <AddressTest />,
  },
  {
    path: "/blog/*",
    element: <BlogRoutes />,
  },
  {
    path: "/order/:orderId/payment-success",
    element: <PaymentSuccess />,
  },
  {
    path: "/order/:orderId/payment-cancel",
    element: <PaymentCancel />,
  },

]
