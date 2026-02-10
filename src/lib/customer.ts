// ============================================================
// PRESSCO 21 — 고객 매출 관리 데이터 페칭 함수
// Notion Official SDK로 Customers, Orders DB를 조회한다.
// ============================================================

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  Customer,
  CustomerSummary,
  Order,
  OrderSummary,
  CustomerFilters,
  OrderFilters,
  OrderItem,
} from "@/types";

// ------------------------------------------------------------
// Notion 클라이언트 초기화
// ------------------------------------------------------------

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[Notion] NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }

  return new Client({ auth: process.env.NOTION_TOKEN });
}

// ------------------------------------------------------------
// 내부 헬퍼: Notion 속성 추출
// ------------------------------------------------------------

/**
 * Notion 페이지 속성에서 타입별로 값을 안전하게 추출한다.
 */
function getProp(
  page: PageObjectResponse,
  key: string,
): string | number | boolean | string[] {
  const prop = page.properties[key];
  if (!prop) return "";

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text ?? "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text ?? "";
    case "select":
      return prop.select?.name ?? "";
    case "multi_select":
      return prop.multi_select.map((s) => s.name);
    case "number":
      return prop.number ?? 0;
    case "checkbox":
      return prop.checkbox;
    case "url":
      return prop.url ?? "";
    case "email":
      return prop.email ?? "";
    case "phone_number":
      return prop.phone_number ?? "";
    case "date":
      return prop.date?.start ?? "";
    case "relation":
      return prop.relation.map((r) => r.id);
    default:
      return "";
  }
}

// ------------------------------------------------------------
// 주문 (Orders)
// ------------------------------------------------------------

/**
 * 모든 주문을 조회한다.
 */
export const getOrders = unstable_cache(
  async (filters?: OrderFilters): Promise<Order[]> => {
    const dbId = process.env.NOTION_DB_ORDERS;
    if (!dbId) {
      console.warn("[Customer] NOTION_DB_ORDERS 환경 변수가 설정되지 않았습니다.");
      return [];
    }

    try {
      const notion = getNotionClient();
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: dbId,
        sorts: [{ property: "order_date", direction: "descending" }],
      });

      const orders = response.results
        .filter((page): page is PageObjectResponse => "properties" in page)
        .map((page) => {
          const itemsJson = getProp(page, "items") as string;
          let items: OrderItem[] = [];
          try {
            items = JSON.parse(itemsJson);
          } catch {
            items = [];
          }

          // customer relation에서 첫 번째 ID 추출
          const customerIds = getProp(page, "customer") as string[];
          const customerId = customerIds[0] || "";

          return {
            id: page.id,
            orderNumber: getProp(page, "order_number") as string,
            customerId,
            orderDate: getProp(page, "order_date") as string,
            items,
            totalAmount: getProp(page, "total_amount") as number,
            paymentMethod: getProp(page, "payment_method") as string,
            status: getProp(page, "status") as string,
            shippingAddress: getProp(page, "shipping_address") as string,
            memo: getProp(page, "memo") as string,
            createdAt: page.created_time,
          } as Order;
        });

      // 필터 적용
      let filtered = orders;

      if (filters?.customerId) {
        filtered = filtered.filter((o) => o.customerId === filters.customerId);
      }

      if (filters?.status) {
        filtered = filtered.filter((o) => o.status === filters.status);
      }

      if (filters?.paymentMethod) {
        filtered = filtered.filter(
          (o) => o.paymentMethod === filters.paymentMethod,
        );
      }

      if (filters?.startDate) {
        filtered = filtered.filter((o) => o.orderDate >= filters.startDate!);
      }

      if (filters?.endDate) {
        filtered = filtered.filter((o) => o.orderDate <= filters.endDate!);
      }

      return filtered;
    } catch (error) {
      console.error("[Customer] getOrders 오류:", error);
      return [];
    }
  },
  ["orders"],
  { revalidate: 3600, tags: ["orders"] },
);

/**
 * ID로 주문을 조회한다.
 */
export const getOrderById = unstable_cache(
  async (id: string): Promise<Order | null> => {
    try {
      const notion = getNotionClient();
      const page = await notion.pages.retrieve({ page_id: id });

      if (!("properties" in page)) return null;

      const itemsJson = getProp(page, "items") as string;
      let items: OrderItem[] = [];
      try {
        items = JSON.parse(itemsJson);
      } catch {
        items = [];
      }

      const customerIds = getProp(page, "customer") as string[];
      const customerId = customerIds[0] || "";

      return {
        id: page.id,
        orderNumber: getProp(page, "order_number") as string,
        customerId,
        orderDate: getProp(page, "order_date") as string,
        items,
        totalAmount: getProp(page, "total_amount") as number,
        paymentMethod: getProp(page, "payment_method") as string,
        status: getProp(page, "status") as string,
        shippingAddress: getProp(page, "shipping_address") as string,
        memo: getProp(page, "memo") as string,
        createdAt: page.created_time,
      } as Order;
    } catch (error) {
      console.error("[Customer] getOrderById 오류:", error);
      return null;
    }
  },
  ["order"],
  { revalidate: 600, tags: ["orders"] },
);

/**
 * 여러 주문 ID로 주문 요약 목록을 조회한다.
 */
export async function getOrderSummariesByIds(
  ids: string[],
): Promise<OrderSummary[]> {
  if (ids.length === 0) return [];

  try {
    const orders = await Promise.all(ids.map((id) => getOrderById(id)));
    return orders
      .filter((order): order is Order => order !== null)
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
      }));
  } catch (error) {
    console.error("[Customer] getOrderSummariesByIds 오류:", error);
    return [];
  }
}

// ------------------------------------------------------------
// 고객 (Customers)
// ------------------------------------------------------------

/**
 * 모든 고객을 조회한다.
 */
export const getCustomers = unstable_cache(
  async (filters?: CustomerFilters): Promise<Customer[]> => {
    const dbId = process.env.NOTION_DB_CUSTOMERS;
    if (!dbId) {
      console.warn(
        "[Customer] NOTION_DB_CUSTOMERS 환경 변수가 설정되지 않았습니다.",
      );
      return [];
    }

    try {
      const notion = getNotionClient();
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: dbId,
        sorts: [{ property: "last_order_date", direction: "descending" }],
      });

      const customers = await Promise.all(
        response.results
          .filter((page): page is PageObjectResponse => "properties" in page)
          .map(async (page) => {
            // orders relation 조회
            const orderIds = getProp(page, "orders") as string[];
            const orders = await getOrderSummariesByIds(orderIds);

            return {
              id: page.id,
              name: getProp(page, "name") as string,
              phone: getProp(page, "phone") as string,
              email: getProp(page, "email") as string,
              address: getProp(page, "address") as string,
              company: getProp(page, "company") as string,
              customerType: getProp(page, "customer_type") as string,
              grade: getProp(page, "grade") as string,
              totalOrders: getProp(page, "total_orders") as number,
              totalAmount: getProp(page, "total_amount") as number,
              lastOrderDate: getProp(page, "last_order_date") as string,
              memo: getProp(page, "memo") as string,
              orders,
              createdAt: page.created_time,
            } as Customer;
          }),
      );

      // 필터 적용
      let filtered = customers;

      if (filters?.customerType) {
        filtered = filtered.filter(
          (c) => c.customerType === filters.customerType,
        );
      }

      if (filters?.grade) {
        filtered = filtered.filter((c) => c.grade === filters.grade);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.phone.includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower) ||
            c.company.toLowerCase().includes(searchLower),
        );
      }

      return filtered;
    } catch (error) {
      console.error("[Customer] getCustomers 오류:", error);
      return [];
    }
  },
  ["customers"],
  { revalidate: 3600, tags: ["customers"] },
);

/**
 * ID로 고객을 조회한다.
 */
export const getCustomerById = unstable_cache(
  async (id: string): Promise<Customer | null> => {
    try {
      const notion = getNotionClient();
      const page = await notion.pages.retrieve({ page_id: id });

      if (!("properties" in page)) return null;

      // orders relation 조회
      const orderIds = getProp(page, "orders") as string[];
      const orders = await getOrderSummariesByIds(orderIds);

      return {
        id: page.id,
        name: getProp(page, "name") as string,
        phone: getProp(page, "phone") as string,
        email: getProp(page, "email") as string,
        address: getProp(page, "address") as string,
        company: getProp(page, "company") as string,
        customerType: getProp(page, "customer_type") as string,
        grade: getProp(page, "grade") as string,
        totalOrders: getProp(page, "total_orders") as number,
        totalAmount: getProp(page, "total_amount") as number,
        lastOrderDate: getProp(page, "last_order_date") as string,
        memo: getProp(page, "memo") as string,
        orders,
        createdAt: page.created_time,
      } as Customer;
    } catch (error) {
      console.error("[Customer] getCustomerById 오류:", error);
      return null;
    }
  },
  ["customer"],
  { revalidate: 600, tags: ["customers"] },
);

/**
 * 고객 요약 목록을 조회한다 (검색/필터 기능 포함).
 */
export async function getCustomerSummaries(
  filters?: CustomerFilters,
): Promise<CustomerSummary[]> {
  const customers = await getCustomers(filters);
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    customerType: c.customerType,
    grade: c.grade,
    totalOrders: c.totalOrders,
    totalAmount: c.totalAmount,
    lastOrderDate: c.lastOrderDate,
  }));
}
