const { Schema, model } = require("mongoose");

const COLLECTION_NAME = 'Orders';
const DOCUMENT_NAME = 'Order';

const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
}

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    PARTIAL: 'partial',
    FAILED: 'failed',
    REFUNDED: 'refunded'
}

const orderSchema = new Schema({
    // User reference (null for guest orders)
    order_userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Customer information
    order_customer: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        address: {
            type: String,
            trim: true,
            maxlength: [500, 'Address cannot exceed 500 characters']
        },
        note: {
            type: String,
            default: '',
            maxlength: [1000, 'Note cannot exceed 1000 characters']
        }
    },

    // Checkout information
    order_checkout: {
        subtotal: { type: Number, required: true, min: 0 }, // Tổng tiền trước discount và ship
        discount_amount: { type: Number, default: 0, min: 0 }, // Số tiền giảm giá
        shipping_fee: { type: Number, required: true, min: 0 }, // Phí ship
        total: { type: Number, required: true, min: 0 }, // Tổng cuối cùng
    },

    // Discount information
    order_discount: {
        discount_id: { type: Schema.Types.ObjectId, ref: 'Discount', default: null },
        discount_code: { type: String, default: '' },
        discount_name: { type: String, default: '' },
        discount_type: {
            type: String,
            enum: ['percentage', 'fixed_amount'],
            default: null
        },
        discount_value: { type: Number, default: 0 },
        discount_amount: { type: Number, default: 0 }
    },

    // Shipping address (detailed with codes and names)
    order_shipping: {
        province: {
            code: { type: String, default: '' },
            name: { type: String, default: '' }
        },
        district: {
            code: { type: String, default: '' },
            name: { type: String, default: '' }
        },
        ward: {
            code: { type: String, default: '' },
            name: { type: String, default: '' }
        },
        street: { type: String, default: '' }, // Số nhà, tên đường cụ thể
        full_address: { type: String, default: '' } // Địa chỉ đầy đủ đã format
    },

    // Payment information
    order_payment: {
        method: {
            type: String,
            enum: ['cod', 'bank_transfer', 'momo', 'vnpay'],
            default: 'cod'
        },
        status: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING
        },
        transaction_id: { type: String, default: '' },
        paid_at: { type: Date, default: null }
    },

    // Products in order
    order_products: [{
        product_id: { type: Schema.Types.ObjectId, ref: 'spu', required: true },
        product_name: { type: String, required: true },
        product_slug: { type: String, required: true },
        product_image: { type: String, required: true },
        product_price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        total_price: { type: Number, required: true, min: 0 },
        // Product attributes if any
        product_attribute: {
            name: { type: String, default: '' },
            unit: { type: String, default: '' },
            price: { type: Number, default: 0 }
        }
    }],

    // Order tracking
    order_trackingNumber: {
        type: String,
        required: true,
        unique: true
    },

    // Order status
    order_status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PENDING,
        index: true
    },

    // Status history for tracking
    status_history: [{
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            required: true
        },
        note: { type: String, default: '' },
        updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        updated_at: { type: Date, default: Date.now }
    }],

    // Payment status history
    payment_history: [{
        status: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            required: true
        },
        updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        updated_at: { type: Date, default: Date.now }
    }],

    // Additional fields
    order_notes: { type: String, default: '' }, // Internal notes
    estimated_delivery: { type: Date, default: null },
    actual_delivery: { type: Date, default: null }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// Indexes for performance
orderSchema.index({ order_userId: 1, createdAt: -1 })
orderSchema.index({ order_status: 1, createdAt: -1 })
orderSchema.index({ 'order_customer.email': 1 })
orderSchema.index({ 'order_customer.phone': 1 })
// Note: order_trackingNumber already has unique index, no need for additional index

// Virtual for order total items
orderSchema.virtual('total_items').get(function () {
    return this.order_products.reduce((total, item) => total + item.quantity, 0)
})

// Virtual for formatted tracking number
orderSchema.virtual('formatted_tracking').get(function () {
    return `#${this.order_trackingNumber}`
})

function generate8DigitTrackingNumber() {
    // Chữ số đầu: 1-9
    const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
    // 7 chữ số còn lại: 0-9
    const restDigits = Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, '0'); // đảm bảo đủ 7 chữ số
    return `${firstDigit}${restDigits}`;
}
// Pre-save middleware to generate tracking number
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.order_trackingNumber) {
        this.order_trackingNumber = generate8DigitTrackingNumber();
    }

    // Add status to history if status changed
    if (this.isModified('order_status') && !this.isNew) {
        this.status_history.push({
            status: this.order_status,
            updated_at: new Date()
        });
    }

    next();
});

// Static method to generate next tracking number
orderSchema.statics.generateTrackingNumber = async function () {
    return generate8DigitTrackingNumber();
};
const Order = model(DOCUMENT_NAME, orderSchema);

module.exports = Order;
module.exports.ORDER_STATUS = ORDER_STATUS;
module.exports.PAYMENT_STATUS = PAYMENT_STATUS;