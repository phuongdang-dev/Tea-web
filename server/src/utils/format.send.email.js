export const FormMail = (webName, webUrl, email, dueTime) => {
  return `
    <div style="font-family: 'Arial', sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; max-width: 500px; margin: 40px auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); background-color: #f9f9f9;">
      <h2 style="color: #333; text-align: center; margin-bottom: 25px; font-weight: 600;">
        <span style="color: #007bff;">${webName}</span> - Xác minh tài khoản
      </h2>

      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        Xin chào! Cảm ơn bạn đã đăng ký tài khoản tại <span style="font-weight: bold; color: #007bff;">${webName}</span>.
        Vui lòng xác minh email của bạn để hoàn tất quá trình đăng ký.
      </p>

      <div style="background-color: #f0f8ff; padding: 20px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #b0c4de;">
        <p style="font-size: 14px; color: #444; margin-bottom: 10px;">
          <strong>Email:</strong> ${email}
        </p>
      
        <p style="font-size: 14px; color: #444;">
          <strong>Thời gian hết hạn liên kết:</strong> ${dueTime}
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 25px;">
        <a href="${webUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Xác minh tài khoản
        </a>
      </div>

      <p style="font-size: 14px; color: #777; line-height: 1.5; text-align: center;">
        Nếu bạn không yêu cầu xác minh tài khoản, vui lòng bỏ qua email này. Liên kết sẽ hết hạn sau ${dueTime}.
      </p>

      <p style="font-size: 14px; color: #555; text-align: center; margin-top: 30px;">
        Trân trọng,<br>Đội ngũ <span style="font-weight: bold; color: #007bff;">${webName}</span>
      </p>
    </div>
  `;
};

export const OrderPlacedCustomerMail = (webName, webUrl, order) => {
  const customerName = order?.order_customer?.name || 'Quý khách'
  const trackingNumber = order?.order_trackingNumber || ''
  const itemsHtml = (order?.order_products || [])
    .map((item) => {
      const attr = item?.product_attribute?.name ? ` (${item.product_attribute.name})` : ''
      const qty = item?.quantity ?? 0
      const price = item?.product_price ?? 0
      const total = item?.total_price ?? 0
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${item?.product_name || ''}${attr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">${price.toLocaleString('vi-VN')}đ</td>
          <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">${total.toLocaleString('vi-VN')}đ</td>
        </tr>
      `
    })
    .join('')

  const subtotal = order?.order_checkout?.subtotal ?? 0
  const discountAmount = order?.order_checkout?.discount_amount ?? 0
  const shippingFee = order?.order_checkout?.shipping_fee ?? 0
  const grandTotal = order?.order_checkout?.total ?? 0
  const fullAddress = order?.order_shipping?.full_address || order?.order_customer?.address || ''
  const customerPhone = order?.order_customer?.phone || ''
  const customerEmail = order?.order_customer?.email || ''
  const note = order?.order_customer?.note || ''

  return `
    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 720px; margin: 24px auto; background-color: #ffffff;">
      <h2 style="margin: 0 0 14px; color: #111;">${webName} - Xác nhận đặt hàng</h2>
      <p style="margin: 0 0 12px; color: #444; line-height: 1.6;">Xin chào <strong>${customerName}</strong>, bạn vừa đặt đơn hàng thành công.</p>
      <p style="margin: 0 0 18px; color: #444; line-height: 1.6;">Mã đơn hàng: <strong>#${trackingNumber}</strong></p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
        <p style="margin: 0 0 6px; color: #334155;"><strong>Thông tin nhận hàng</strong></p>
        <p style="margin: 0; color: #475569;">${customerName} - ${customerPhone}</p>
        <p style="margin: 0; color: #475569;">${customerEmail}</p>
        <p style="margin: 0; color: #475569;">${fullAddress}</p>
        ${note ? `<p style="margin: 10px 0 0; color: #475569;"><strong>Ghi chú:</strong> ${note}</p>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Sản phẩm</th>
            <th style="text-align: center; padding: 10px; border-bottom: 2px solid #eaeaea;">SL</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eaeaea;">Đơn giá</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eaeaea;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || ''}
        </tbody>
      </table>

      <div style="margin-bottom: 18px;">
        <p style="margin: 4px 0; color: #334155;"><strong>Tạm tính:</strong> ${subtotal.toLocaleString('vi-VN')}đ</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Giảm giá:</strong> -${discountAmount.toLocaleString('vi-VN')}đ</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Phí vận chuyển:</strong> ${shippingFee.toLocaleString('vi-VN')}đ</p>
        <p style="margin: 10px 0 0; color: #111; font-size: 18px;"><strong>Tổng cộng:</strong> ${grandTotal.toLocaleString('vi-VN')}đ</p>
      </div>

      <div style="text-align: center; margin-top: 18px;">
        <a href="${webUrl}" style="background-color: #0f172a; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; display: inline-block;">Xem website</a>
      </div>

      <p style="margin: 18px 0 0; font-size: 12px; color: #64748b; text-align: center;">Email này được gửi tự động từ ${webName}.</p>
    </div>
  `
}

export const OrderPaidCompanyMail = (webName, order) => {
  const trackingNumber = order?.order_trackingNumber || ''
  const customerName = order?.order_customer?.name || ''
  const customerPhone = order?.order_customer?.phone || ''
  const customerEmail = order?.order_customer?.email || ''
  const total = order?.order_checkout?.total ?? 0

  return `
    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 640px; margin: 24px auto; background-color: #ffffff;">
      <h2 style="margin: 0 0 14px; color: #111;">${webName} - Thông báo thanh toán</h2>
      <p style="margin: 0 0 12px; color: #444; line-height: 1.6;">Khách hàng vừa thanh toán thành công.</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
        <p style="margin: 0 0 6px; color: #334155;"><strong>Mã đơn:</strong> #${trackingNumber}</p>
        <p style="margin: 0 0 6px; color: #334155;"><strong>Tổng tiền:</strong> ${total.toLocaleString('vi-VN')}đ</p>
        <p style="margin: 0 0 6px; color: #334155;"><strong>Khách hàng:</strong> ${customerName}</p>
        <p style="margin: 0 0 6px; color: #334155;"><strong>SĐT:</strong> ${customerPhone}</p>
        <p style="margin: 0; color: #334155;"><strong>Email:</strong> ${customerEmail}</p>
      </div>
      <p style="margin: 18px 0 0; font-size: 12px; color: #64748b; text-align: center;">Email này được gửi tự động từ ${webName}.</p>
    </div>
  `
}

export const OrderPaidCustomerMail = (webName, order) => {
  const customerName = order?.order_customer?.name || 'Quý khách'
  const trackingNumber = order?.order_trackingNumber || ''
  const total = order?.order_checkout?.total ?? 0
  return `
    <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 640px; margin: 24px auto; background-color: #ffffff;">
      <h2 style="margin: 0 0 14px; color: #111;">${webName} - Thanh toán thành công</h2>
      <p style="margin: 0 0 12px; color: #444; line-height: 1.6;">Xin chào <strong>${customerName}</strong>, bạn đã thanh toán thành công cho đơn hàng <strong>#${trackingNumber}</strong>.</p>
      <p style="margin: 0; color: #111; font-size: 18px;"><strong>Số tiền:</strong> ${total.toLocaleString('vi-VN')}đ</p>
      <p style="margin: 18px 0 0; font-size: 12px; color: #64748b; text-align: center;">Email này được gửi tự động từ ${webName}.</p>
    </div>
  `
}
