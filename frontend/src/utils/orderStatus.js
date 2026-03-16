export const ORDER_STATUS_PRIORITY = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled"
];

const STATUS_ALIASES = {
  "order placed": "Pending",
  "in transit": "Shipped"
};

export const ORDER_STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Processing: "bg-blue-50 text-blue-700 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Unknown: "bg-slate-100 text-slate-700 border-slate-200"
};

export const normalizeOrderStatus = (status) => {
  const raw = String(status || "").trim();
  if (!raw) return "Pending";

  const fromAlias = STATUS_ALIASES[raw.toLowerCase()];
  if (fromAlias) return fromAlias;

  const exact = ORDER_STATUS_PRIORITY.find((s) => s.toLowerCase() === raw.toLowerCase());
  return exact || raw;
};

export const getOrderStatusClass = (status) => {
  const normalized = normalizeOrderStatus(status);
  return ORDER_STATUS_STYLES[normalized] || ORDER_STATUS_STYLES.Unknown;
};

export const getDisplayOrderStatus = (status) => normalizeOrderStatus(status);
