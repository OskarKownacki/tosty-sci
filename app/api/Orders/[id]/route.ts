import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status } = await request.json();
        
        const client = await clientPromise;
        const db = client.db("tosty-sci");
        const collection = db.collection("orders");
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );
        
        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
        }
        
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error("Error updating order:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }), { status: 500 });
    }
}
