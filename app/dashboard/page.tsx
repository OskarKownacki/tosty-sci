import { MongoClient } from "mongodb";

export default async function Page() {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const orders = await client.db().collection("orders").find().toArray();

    return (
        <div className="px-24">
            <h1 className="text-4xl font-bold">Zamówienia!</h1>
            <div className="flex items-center justify-center h-screen">
                {orders.map((order) => (
                    <div key={order._id.toString()} className="p-4 border rounded mb-2">
                        <h2 className="text-2xl font-semibold">{order.name}</h2>
                        <p>Amount: {order.amount}</p>
                        <p>Ingredients: {order.ingredients.join(", ")}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}