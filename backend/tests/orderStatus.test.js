const {
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LIST,
  TRACKING_STATUS,
} = require("../constants/orderStatus");

describe("backend/constants/orderStatus", () => {
  test("exports expected order statuses", () => {
    expect(ORDER_STATUS.PENDING).toBe("Pending");
    expect(ORDER_STATUS.PROCESSING).toBe("Processing");
    expect(ORDER_STATUS.SHIPPED).toBe("Shipped");
    expect(ORDER_STATUS.DELIVERED).toBe("Delivered");
    expect(ORDER_STATUS.CANCELLED).toBe("Cancelled");
  });

  test("order and payment lists contain all status values", () => {
    expect(ORDER_STATUS_LIST).toEqual([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ]);

    expect(PAYMENT_STATUS_LIST).toEqual(["Pending", "Paid", "Failed"]);
  });

  test("tracking status has order placed", () => {
    expect(TRACKING_STATUS.ORDER_PLACED).toBe("Order Placed");
  });

  test("status objects are frozen", () => {
    expect(Object.isFrozen(ORDER_STATUS)).toBe(true);
    expect(Object.isFrozen(PAYMENT_STATUS)).toBe(true);
    expect(Object.isFrozen(TRACKING_STATUS)).toBe(true);
    expect(Object.isFrozen(ORDER_STATUS_LIST)).toBe(true);
    expect(Object.isFrozen(PAYMENT_STATUS_LIST)).toBe(true);
  });
});
