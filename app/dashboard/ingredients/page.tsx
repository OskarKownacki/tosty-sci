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
        <div className="flex w-full max-w-3xl flex-col gap-4 pb-6 pt-2 sm:pb-10 sm:pt-4">
            <h1 className="text-3xl font-bold sm:text-4xl">Składniki</h1>
            <h2 className="text-xl font-semibold sm:text-2xl">Lista składników</h2>
            <IngredientsList initialIngredients={serializedIngredients} />
            <h2 className="text-xl font-semibold sm:text-2xl">Dodaj składnik</h2>
            <AddIngredientForm />
        </div>
    );
}