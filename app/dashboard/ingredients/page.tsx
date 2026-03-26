import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import IngredientsList from "../../../components/IngredientsList";
import AddIngredientForm from "./AddIngredientForm";

type Ingredient = {
    _id: ObjectId;
    name: string;
};

export default async function Page() {
    const client = await clientPromise;
    const ingredients = await client
        .db("tosty-sci")
        .collection<Ingredient>("ingredients")
        .find({})
        .toArray();


    const serializedIngredients = ingredients.map((ingredient) => ({
        _id: ingredient._id.toString(),
        name: ingredient.name,
    }));

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Składniki</h1>
            <h2 className="text-2xl font-semibold">Lista składników</h2>
            <IngredientsList initialIngredients={serializedIngredients} />
            <h2 className="text-2xl font-semibold">Dodaj składnik</h2>
                        <AddIngredientForm />
        </div>
    );
}