const ORDER_STATUS = Object.freeze({
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  ORDER_CONFIRMED: "Order Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed"
});

const TRACKING_STATUS = Object.freeze({
  ORDER_PLACED: "Order Placed"
});

const ORDER_STATUS_LIST = Object.freeze(Object.values(ORDER_STATUS));
const PAYMENT_STATUS_LIST = Object.freeze(Object.values(PAYMENT_STATUS));

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LIST,
  TRACKING_STATUS
};
