"use client";

import { useState, useEffect } from "react";
import { orderSchema } from "@/types"; // adjust path as needed
import { z } from "zod";

interface Ingredient {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  name: string;
  status?: "pending" | "done" | "granted";
}

type OrderErrors = Partial<Record<keyof z.infer<typeof orderSchema>, string>>;

const SAVED_NAME_KEY = "tosty.customer.name";
const NOTIFIED_READY_ORDERS_KEY = "tosty.orders.ready.notified";

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [readyBannerMessage, setReadyBannerMessage] = useState<string | null>(null);
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem(SAVED_NAME_KEY) ?? "";
  });

  useEffect(() => {
    fetch("/api/Ingredients", { method: "GET" })
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!name.trim()) {
      return;
    }

    const normalizedName = name.trim().toLowerCase();

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/Orders", { method: "GET" });
        if (!response.ok) {
          return;
        }

        const orders: Order[] = await response.json();
        const readyOrders = orders.filter(
          (order) =>
            order.status === "done" &&
            order.name?.trim().toLowerCase() === normalizedName,
        );

        if (readyOrders.length === 0) {
          return;
        }

        const canUseNotifications = "Notification" in window;
        const notifiedIds = new Set<string>(
          JSON.parse(localStorage.getItem(NOTIFIED_READY_ORDERS_KEY) ?? "[]"),
        );
        const fallbackReadyNames: string[] = [];

        for (const order of readyOrders) {
          const orderId = String(order._id);
          if (notifiedIds.has(orderId)) {
            continue;
          }

          let sentNotification = false;

          if (canUseNotifications) {
            if (Notification.permission === "default") {
              await Notification.requestPermission();
            }

            if (Notification.permission === "granted") {
              new Notification("Zamowienie gotowe", {
                body: `Twoje zamowienie (${order.name}) jest gotowe do odbioru.`,
              });
              sentNotification = true;
            }
          }

          if (!sentNotification) {
            fallbackReadyNames.push(order.name);
          }

          notifiedIds.add(orderId);
        }

        if (fallbackReadyNames.length > 0) {
          setReadyBannerMessage(
            `Twoje zamowienie jest gotowe: ${fallbackReadyNames.join(", ")}`,
          );
        }

        localStorage.setItem(
          NOTIFIED_READY_ORDERS_KEY,
          JSON.stringify(Array.from(notifiedIds)),
        );
      } catch (error) {
        console.error("Error checking ready orders:", error);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [name]);

  function handleOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setErrors({});

  const form = event.currentTarget; // grab reference immediately

  const formData = new FormData(form);
  const submittedName = (formData.get("name") as string) ?? "";
  const amount = Number(formData.get("amount"));
const selectedIngredients = ingredients
  .filter((ingredient) => formData.get(ingredient._id))
  .map((ingredient) => ingredient.name); // was ingredient._id

  const result = orderSchema.safeParse({ name: submittedName, amount, ingredients: selectedIngredients });

  if (!result.success) {
    const fieldErrors: OrderErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof OrderErrors;
      fieldErrors[field] = issue.message;
    }
    setErrors(fieldErrors);
    return;
  }

  fetch("/api/Orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Order placed:", data);
      const trimmedName = result.data.name.trim();
      localStorage.setItem(SAVED_NAME_KEY, trimmedName);
      setName(trimmedName);
      form.reset(); // use the saved reference instead
    })
    .catch((err) => console.error(err));
}

  return (
    <div className="flex w-full flex-col items-center pb-6 pt-2 sm:pb-10 sm:pt-4">
      <main className="flex w-full max-w-3xl flex-col bg-background2 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Zamów tosta!</h1>
        <hr className="mb-4" />

        {readyBannerMessage ? (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-base border border-default-medium bg-secondary/25 px-4 py-3 text-sm text-body">
            <p>{readyBannerMessage}</p>
            <button
              type="button"
              onClick={() => setReadyBannerMessage(null)}
              className="shrink-0 rounded border border-default-medium px-2 py-1 text-xs hover:bg-background"
            >
              Zamknij
            </button>
          </div>
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleOrderSubmit}>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label htmlFor="name" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1">
              Imię i nazwisko
            </label>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label htmlFor="amount" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto inset-s-1">
              Ilość
            </label>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div className="flex flex-col gap-2">
            {ingredients.map((ingredient) => (
              <div key={ingredient._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={ingredient._id}
                  name={ingredient._id}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor={ingredient._id} className="text-sm font-medium text-body">
                  {ingredient.name}
                </label>
              </div>
            ))}
            {errors.ingredients && <p className="text-red-500 text-xs mt-1">{errors.ingredients}</p>}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-foreground rounded hover:bg-primary-dark transition-colors"
          >
            Zamawiam!
          </button>
        </form>
      </main>
    </div>
  );
}