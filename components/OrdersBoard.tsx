"use client";

import { useEffect, useRef, useState } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

type Order = {
  _id: string;
  name: string;
  amount: number;
  ingredients: string[];
  status: "pending" | "done" | "granted";
  grantedAt?: string | null;
};

type OrderFromApi = {
  _id: string | { toString?: () => string };
  name: string;
  amount: number;
  ingredients?: string[];
  status?: "pending" | "done" | "granted";
  grantedAt?: string | null;
};

const GRANTED_TTL_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 45 * 1000;

function normalizeOrder(o: OrderFromApi): Order {
  const id =
    typeof o._id === "string"
      ? o._id
      : (o._id as { toString?: () => string })?.toString?.() ?? String(o._id);
  return {
    _id: id,
    name: o.name,
    amount: o.amount,
    ingredients: o.ingredients ?? [],
    status: o.status ?? "pending",
    grantedAt: o.grantedAt ? new Date(o.grantedAt).toISOString() : null,
  };
}

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
  const removalTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const isInteractingRef = useRef(false);

  useEffect(() => {
    return () => {
      Object.values(removalTimersRef.current).forEach(clearTimeout);
      removalTimersRef.current = {};
    };
  }, []);

  // Poll the server every 45 s, pausing during drag-and-drop interactions
  useEffect(() => {
    const pollOrders = async () => {
      if (isInteractingRef.current) return;
      try {
        const res = await fetch("/api/Orders", { cache: "no-store" });
        if (!res.ok) return;
        const raw: OrderFromApi[] = await res.json();
        const now = Date.now();

        // Normalize and apply the same TTL filter used during the initial server render
        const normalized = raw
          .map(normalizeOrder)
          .filter((o) => {
            if (o.status !== "granted") return true;
            if (!o.grantedAt) return true;
            return now - new Date(o.grantedAt).getTime() < GRANTED_TTL_MS;
          });

        // Set removal timers for any newly-granted orders not already tracked
        for (const order of normalized) {
          if (order.status === "granted" && !removalTimersRef.current[order._id]) {
            const grantedTime = order.grantedAt ? new Date(order.grantedAt).getTime() : now;
            const remaining = Math.max(0, GRANTED_TTL_MS - (now - grantedTime));
            const id = order._id;
            removalTimersRef.current[id] = setTimeout(() => {
              setOrders((prev) => prev.filter((o) => o._id !== id));
              delete removalTimersRef.current[id];
            }, remaining);
          }
        }

        // Clear timers for orders that are no longer present in the snapshot
        const snapshotIds = new Set(normalized.map((o) => o._id));
        for (const id of Object.keys(removalTimersRef.current)) {
          if (!snapshotIds.has(id)) {
            clearTimeout(removalTimersRef.current[id]);
            delete removalTimersRef.current[id];
          }
        }

        setOrders(normalized);
      } catch (err) {
        console.error("Failed to poll orders:", err);
      }
    };

    const interval = setInterval(pollOrders, POLL_INTERVAL_MS);
    void pollOrders();
    return () => clearInterval(interval);
  }, []);

  function handleDragStart() {
    isInteractingRef.current = true;
  }

  function handleDragCancel() {
    isInteractingRef.current = false;
  }

  function handleDragEnd(event: DragEndEvent) {
    isInteractingRef.current = false;
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as Order["status"];

    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    // Allow movement to any column
    if (order.status === newStatus) return; // no-op if same column

    const existingTimer = removalTimersRef.current[orderId];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete removalTimersRef.current[orderId];
    }

    // Update locally
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
              ...o,
              status: newStatus,
              grantedAt: newStatus === "granted" ? new Date().toISOString() : null,
            }
          : o,
      )
    );

    if (newStatus === "granted") {
      removalTimersRef.current[orderId] = setTimeout(() => {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        delete removalTimersRef.current[orderId];
      }, GRANTED_TTL_MS);
    }

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
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  status: order.status,
                  grantedAt: order.grantedAt ?? null,
                }
              : o,
          )
        );

        const timerToClear = removalTimersRef.current[orderId];
        if (timerToClear) {
          clearTimeout(timerToClear);
          delete removalTimersRef.current[orderId];
        }
      });
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
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