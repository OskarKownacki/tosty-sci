import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const {name} = await request.json();
        const client = await clientPromise;
        const db = client.db("tosty-sci");
        const collection = db.collection("ingredients");
        const result = await collection.insertOne({name});
        return new Response(JSON.stringify(result), {status: 201});
    } catch (error) {
        console.error("Error inserting ingredient:", error);
        return new Response("Internal Server Error", {status: 500});
    }
}

export async function GET(){
    try {
        const client = await clientPromise;
        const db = client.db("tosty-sci");
        const collection = db.collection("ingredients");
        const ingredients = await collection.find({}).toArray();
        return new Response(JSON.stringify(ingredients), {status: 200});
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        return new Response("Internal Server Error", {status: 500});
    }   
}