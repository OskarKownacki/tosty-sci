"use client";

import dynamic from "next/dynamic";

const OrdersBoard = dynamic(() => import("@/components/OrdersBoard"), { ssr: false });

type Order = {
  _id: string;
  name: string;
  amount: number;
  ingredients: string[];
  status: "pending" | "done" | "granted";
};

export default function OrdersBoardWrapper({ initialOrders }: { initialOrders: Order[] }) {
  return <OrdersBoard initialOrders={initialOrders} />;
}
