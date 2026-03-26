"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const ingredientSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nazwa musi mieć co najmniej 2 znaki")
        .max(100, "Nazwa nie może być dłuższa niż 100 znaków"),
});

type FieldErrors = {
    name?: string;
};

export default function AddIngredientForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setServerError("");

        const parsed = ingredientSchema.safeParse({ name });
        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            setErrors({
                name: fieldErrors.name?.[0],
            });
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/Ingredients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: parsed.data.name }),
            });

            if (!response.ok) {
                throw new Error("Nie udało się dodać składnika");
            }

            setName("");
            router.refresh();
        } catch (error) {
            console.error("Error adding ingredient:", error);
            setServerError("Wystąpił błąd podczas dodawania składnika");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="peer relative z-0 block w-full appearance-none rounded-base border border-default-medium bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-heading focus:border-brand focus:outline-none focus:ring-0"
                    placeholder=" "
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                />
                <label
                    htmlFor="name"
                    className="absolute inset-s-1 top-2 z-10 inline-block origin-left -translate-y-4 scale-75 transform bg-(--color-background) px-2 text-sm text-body duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-fg-brand"
                >
                    Nazwa składnika
                </label>
            </div>

            {errors.name ? (
                <p id="name-error" className="text-xs text-red-500">
                    {errors.name}
                </p>
            ) : null}

            {serverError ? <p className="text-xs text-red-500">{serverError}</p> : null}

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-base border border-default-medium px-3 py-2 text-sm font-medium hover:bg-background2 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? "Dodawanie..." : "Dodaj składnik"}
            </button>
        </form>
    );
}
