import {
  ORDER_STATUS_PRIORITY,
  ORDER_STATUS_STYLES,
  getDisplayOrderStatus,
  getOrderStatusClass,
  normalizeOrderStatus,
} from "./orderStatus";

describe("frontend/utils/orderStatus", () => {
  test("normalizes empty status to Pending", () => {
    expect(normalizeOrderStatus("")).toBe("Pending");
    expect(normalizeOrderStatus(null)).toBe("Pending");
  });

  test("normalizes aliases", () => {
    expect(normalizeOrderStatus("order placed")).toBe("Pending");
    expect(normalizeOrderStatus("in transit")).toBe("Shipped");
  });

  test("normalizes known statuses case-insensitively", () => {
    expect(normalizeOrderStatus("processing")).toBe("Processing");
    expect(normalizeOrderStatus("DELIVERED")).toBe("Delivered");
  });

  test("returns raw value for unknown statuses", () => {
    expect(normalizeOrderStatus("Returned")).toBe("Returned");
  });

  test("returns class for known and unknown statuses", () => {
    expect(getOrderStatusClass("Pending")).toBe(ORDER_STATUS_STYLES.Pending);
    expect(getOrderStatusClass("not-known")).toBe(ORDER_STATUS_STYLES.Unknown);
  });

  test("display helper returns normalized label", () => {
    expect(getDisplayOrderStatus("order placed")).toBe("Pending");
  });

  test("priority list remains in expected order", () => {
    expect(ORDER_STATUS_PRIORITY).toEqual([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ]);
  });
});
