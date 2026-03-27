"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

type Order = {
  _id: string;
  name: string;
  amount: number;
  ingredients: string[];
  status: "pending" | "done" | "granted";
};

type Column = {
  id: Order["status"];
  label: string;
};

const COLUMNS: Column[] = [
  { id: "pending", label: "Oczekujące" },
  { id: "done", label: "Gotowe" },
  { id: "granted", label: "Wydane" },
];

function OrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order._id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 border rounded-lg bg-background cursor-grab shadow-sm ${isDragging ? "opacity-50" : ""}`}
    >
      <h2 className="text-lg font-semibold">{order.name}</h2>
      <p className="text-sm text-body">Ilość: {order.amount}</p>
      <p className="text-sm text-body">Składniki: {order.ingredients.join(", ")}</p>
    </div>
  );
}

function Column({ column, orders }: { column: Column; orders: Order[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-64 w-full flex-col gap-3 rounded-xl border-2 p-4 transition-colors md:flex-1 ${
        isOver ? "border-brand bg-brand/10" : "border-default-medium bg-background2"
      }`}
    >
      <h2 className="mb-2 text-lg font-bold sm:text-xl">{column.label}</h2>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
      {orders.length === 0 && (
        <p className="text-sm text-body text-center mt-4 opacity-50">No orders</p>
      )}
    </div>
  );
}

export default function OrdersBoard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as Order["status"];

    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    // Allow movement to any column
    if (order.status === newStatus) return; // no-op if same column

    // Update locally
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    // Persist to API
    fetch(`/api/Orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => console.log("Order updated:", data))
      .catch((err) => {
        console.error("Failed to update order status:", err);
        // Revert local change on error
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: order.status } : o))
        );
      });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 py-4 md:flex-row md:gap-6 md:py-6">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            orders={orders.filter((o) => o.status === column.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}