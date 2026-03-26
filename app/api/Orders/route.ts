import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const {name, amount, ingredients} = await request.json();
        const client = await clientPromise;
        const db = client.db("tosty-sci");
        const collection = db.collection("orders");
        const result = await collection.insertOne({name, amount, ingredients, status: "pending"});
        return new Response(JSON.stringify(result), {status: 201});
    } catch (error) {
        console.error("Error inserting order:", error);
        return new Response("Internal Server Error", {status: 500});
    }
}

export async function GET(){
    try {
        const client = await clientPromise;
        const db = client.db("tosty-sci");
        const collection = db.collection("orders");
        const orders = await collection.find({}).toArray();
        return new Response(JSON.stringify(orders), {status: 200});
    } catch (error) {
        console.error("Error fetching orders:", error);
        return new Response("Internal Server Error", {status: 500});
    }   
}