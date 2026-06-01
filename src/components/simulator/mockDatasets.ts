import type { ResultRecord } from "@/types/results";

const countries = ["NG", "US", "UK", "DE", "IN"];
const userStatuses = ["active", "inactive", "banned", "pending"];
const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const products = ["Laptop Pro", "Noise-Cancel Headphones", "Cotton Hoodie", "Design Systems Book", "Granola Pack"];
const categories = ["electronics", "clothing", "books", "food"];
const sources = ["organic", "paid", "social", "referral"];
const events = ["signup", "checkout", "page_view", "download", "upgrade"];

function dateFromDay(day: number): string {
  const date = new Date(Date.UTC(2025, 0, 1 + day));
  return date.toISOString().slice(0, 10);
}

function pick<T>(items: T[], index: number): T {
  const first = items[0];
  if (first === undefined) {
    throw new Error("Cannot pick from an empty dataset source.");
  }
  return items[index % items.length] ?? first;
}

export const mockDatasets: Record<string, ResultRecord[]> = {
  users: Array.from({ length: 100 }, (_, index) => ({
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    age: 18 + (index % 49),
    country: pick(countries, index),
    status: pick(userStatuses, index),
    purchases: (index * 3) % 38,
    createdAt: dateFromDay(index),
    isVerified: index % 3 !== 0
  })),
  orders: Array.from({ length: 100 }, (_, index) => ({
    orderId: `ORD-${String(index + 1).padStart(4, "0")}`,
    amount: 25 + ((index * 47) % 1800),
    product: pick(products, index),
    status: pick(orderStatuses, index),
    quantity: 1 + (index % 8),
    createdAt: dateFromDay(30 + index),
    isPriority: index % 7 === 0
  })),
  products: Array.from({ length: 100 }, (_, index) => ({
    title: `${pick(products, index)} ${index + 1}`,
    price: 10 + ((index * 19) % 700),
    category: pick(categories, index),
    stock: (index * 11) % 240,
    rating: Number((2.5 + (index % 25) / 10).toFixed(1)),
    isActive: index % 6 !== 0,
    createdAt: dateFromDay(60 + index)
  })),
  analytics: Array.from({ length: 100 }, (_, index) => ({
    event: pick(events, index),
    userId: `user-${(index % 30) + 1}`,
    page: ["/", "/pricing", "/dashboard", "/settings", "/checkout"][index % 5] ?? "/",
    duration: 120 + ((index * 97) % 8400),
    source: pick(sources, index),
    timestamp: dateFromDay(90 + index),
    isBounce: index % 4 === 0
  }))
};
