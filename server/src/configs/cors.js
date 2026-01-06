export const corsOptions = {
  origin: function (origin, callback) {
    // ✅ Cho phép server-to-server (webhook, PayOS, Stripe, GHN...)
    if (!origin) {
      return callback(null, true)
    }

    // ✅ Browser request → check whitelist
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(
      new ApiError(
        StatusCodes.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    )
  },

  optionsSuccessStatus: 200,
  credentials: true
}
