import clientPromise from "@/lib/mongodb";
import OrdersBoardWrapper from "@/components/OrdersBoardWrapper";

export default async function Page() {
  const client = await clientPromise;
  const orders = await client.db("tosty-sci").collection("orders").find().toArray();

  const serialized = orders.map((o) => ({
    _id: o._id.toString(),
    name: o.name,
    amount: o.amount,
    ingredients: o.ingredients,
    status: o.status ?? "pending", // default to pending
  }));

  return (
    <div className="flex w-full flex-col pb-6 pt-2 sm:pb-10 sm:pt-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Zamówienia!</h1>
      <OrdersBoardWrapper initialOrders={serialized} />
    </div>
  );
}