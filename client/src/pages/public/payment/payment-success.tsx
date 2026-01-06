import React from 'react'
import { Link } from 'react-router-dom'

export default function PaymentSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
                <div className="mx-auto bg-green-100 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                    </svg>
                </div>

                <h1 className="mt-6 text-2xl font-semibold text-gray-800">Thanh toán thành công!</h1>
                <p className="mt-2 text-gray-600">
                    Cảm ơn bạn. Đơn hàng của bạn đã được ghi nhận. Hóa đơn sẽ được gửi tới email của bạn.
                </p>

                <div className="mt-6 flex flex-col gap-3 items-center">
                    <Link to="/" className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">
                        Về trang chủ
                    </Link>
                    {/* Thay đổi nút ở đây */}
                    <span className="px-4 py-2 bg-green-600 text-white rounded-md">
                        Kiểm tra Email hoặc chúng tôi sẽ sớm liên hệ
                    </span>
                </div>
            </div>
        </div>
    )
}
