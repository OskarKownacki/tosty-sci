"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

type Ingredient = {
    _id: string;
    name: string;
};

export default function IngredientsList({ initialIngredients }: { initialIngredients: Ingredient[] }) {
    const [ingredients, setIngredients] = useState(initialIngredients);

    const handleIngredientRemove = (id: string) => async () => {
        const previousIngredients = ingredients;

        setIngredients((prev) => prev.filter((ingredient) => ingredient._id !== id));

        try {
            const response = await fetch(`/api/Ingredients/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error removing ingredient:", error);
            setIngredients(previousIngredients);
        }
    };

    return (
        <ul className="list-disc pl-6">
            {ingredients.map((ingredient) => (
                <li key={ingredient._id} className="flex items-center gap-2">
                    <span>{ingredient.name}</span>
                    <button
                        type="button"
                        onClick={handleIngredientRemove(ingredient._id)}
                        aria-label={`Remove ${ingredient.name}`}
                        className="rounded border border-default-medium p-1 hover:bg-background2"
                    >
                        <XIcon size={14} />
                    </button>
                </li>
            ))}
        </ul>
    );
}
