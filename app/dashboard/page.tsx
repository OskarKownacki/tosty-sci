import { MongoClient } from "mongodb";
import OrdersBoardWrapper from "@/components/OrdersBoardWrapper";

export default async function Page() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const orders = await client.db().collection("orders").find().toArray();

  const serialized = orders.map((o) => ({
    _id: o._id.toString(),
    name: o.name,
    amount: o.amount,
    ingredients: o.ingredients,
    status: o.status ?? "pending", // default to pending
  }));

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-4xl font-bold p-8 pb-0">Zamówienia!</h1>
      <OrdersBoardWrapper initialOrders={serialized} />
    </div>
  );
}