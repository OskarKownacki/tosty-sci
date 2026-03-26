"use client";

import { useState, useEffect } from "react";
import { orderSchema } from "@/types"; // adjust path as needed
import { z } from "zod";

interface Ingredient {
  _id: string;
  name: string;
}

type OrderErrors = Partial<Record<keyof z.infer<typeof orderSchema>, string>>;

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [errors, setErrors] = useState<OrderErrors>({});

  useEffect(() => {
    fetch("/api/Ingredients", { method: "GET" })
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error(err));
  }, []);

  function handleOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setErrors({});

  const form = event.currentTarget; // grab reference immediately

  const formData = new FormData(form);
  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
const selectedIngredients = ingredients
  .filter((ingredient) => formData.get(ingredient._id))
  .map((ingredient) => ingredient.name); // was ingredient._id

  const result = orderSchema.safeParse({ name, amount, ingredients: selectedIngredients });

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
      form.reset(); // use the saved reference instead
    })
    .catch((err) => console.error(err));
}

  return (
    <div className="flex flex-col flex-1 items-center">
      <main className="p-8 flex flex-col bg-background2 w-1/2">
        <h1 className="text-4xl font-bold mb-4">Zamów tosta!</h1>
        <hr className="mb-4" />
        <form className="flex flex-col gap-4" onSubmit={handleOrderSubmit}>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label htmlFor="name" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
              Imię i nazwisko
            </label>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-heading bg-transparent rounded-base border-1 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
              placeholder=" "
            />
            <label htmlFor="amount" className="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-background2 px-2 peer-focus:px-2 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
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