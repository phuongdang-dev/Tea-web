import React from 'react'
import { Link } from 'react-router-dom'

export default function PaymentCancel() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
                <div className="mx-auto bg-red-100 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.536a1 1 0 10-1.414-1.414L10 8.586 7.879 6.464a1 1 0 10-1.414 1.414L8.586 10l-2.121 2.121a1 1 0 101.414 1.414L10 11.414l2.121 2.121a1 1 0 001.414-1.414L11.414 10l2.122-2.122z" clipRule="evenodd" />
                    </svg>
                </div>

                <h1 className="mt-6 text-2xl font-semibold text-gray-800">Thanh toán bị hủy</h1>
                <p className="mt-2 text-gray-600">Giao dịch không hoàn tất. Bạn có thể thử lại hoặc quay về trang trước.</p>

                <div className="mt-6 flex gap-3 justify-center">
                    <Link to="/cart" className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200">Quay lại giỏ hàng</Link>
                    <Link to="/checkout" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Thử thanh toán lại</Link>
                </div>
            </div>
        </div>
    )
}