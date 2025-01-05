import { NextResponse } from "next/server";
import {
    Firestore,
    VectorQuery,
    VectorQuerySnapshot,
} from "@google-cloud/firestore";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";

const embeddings = new VertexAIEmbeddings({
    model: "text-multilingual-embedding-002"
});

const serviceAccount = require('./get-docs-ai/firebase-service-account.json');
const db = new Firestore({ credentials: serviceAccount })
const coll = db.collection('rag');

export async function POST(request: Request) {
    const { query } = await request.json()
    if (!query) return NextResponse.json({})
        console.log(query, query)
    const vectorQuery: VectorQuery = coll.findNearest({
        vectorField: 'embedding',
        queryVector: await embeddings.embedQuery(query),
        limit: 10,
        distanceMeasure: 'COSINE',
        distanceResultField: 'vector_distance'
    });

    const vectorQuerySnapshot: VectorQuerySnapshot = await vectorQuery.get();
    
    return NextResponse.json(vectorQuerySnapshot.docs.map(d => [d.get('vector_distance'), d.get("text")]))
}