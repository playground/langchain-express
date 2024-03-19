import { ChromaClient, IncludeEnum } from 'chromadb';
//import { Client } from '@ibm-generative-ai/node-sdk';
import { Chroma, ChromaLibArgs } from 'langchain/vectorstores/chroma';

export class ChromaDB {
  client: ChromaClient;
  //bamClient: Client;

  constructor(private chromaUrl = process.env.CHROMA_URL ) {
    this.client = new ChromaClient({path: chromaUrl});
    //this.bamClient = new Client({ endpoint: process.env.GENAI_API, apiKey: process.env.GENAI_KEY });
    //this.client = new ChromaClient({path: chromaUrl, auth: { provider: "basic", credentials: "admin:admin" }});
  }
  async saveFromDocuments(collection: string, chunks: any, model: any, metadata: any) {
    const vectorStore = await Chroma.fromDocuments(
      chunks,
      model,
      {
        collectionName: collection,
        url: this.chromaUrl,
        collectionMetadata: metadata
      }
    )
    return vectorStore;  
  }
  async saveVectorStore(collection: string, chunkDocs: any, embeddingFunction: any, dfConfig: ChromaLibArgs = {url: this.chromaUrl}) {
    const col = await this.createCollection(collection, embeddingFunction);
    const vectorStore = await Chroma.fromDocuments(chunkDocs, embeddingFunction, dfConfig);
    return vectorStore;
  }
  async getCollections() {
    const collections = await this.client.listCollections();
    console.log('collections:', collections)
    return collections;
  }
  async createCollection(collection: string, embeddingFuction) {
    try {
      const col = await this.client.getOrCreateCollection({
        name: collection,
        embeddingFunction: embeddingFuction
      });
      console.log(`collection created: ${col}`);
      return col;
    } catch(e) {
      console.log(e);
    }
  }
  async getCollection(collection: string) {
    try {
      const col = await this.client.getCollection({name: collection});
      return col;
    } catch(e) {
      console.log(e);
    }
  }
  async getCollectionData(collection: string) {
    try {
      const col = await this.client.getCollection({name: collection});
      const data = await col.get({
        include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas]
      })
      return data;
    } catch(e) {
      console.log(e);
    }
  }
  async deleteCollection(collection: string) {
    try {
      await this.client.deleteCollection({name: collection});
      console.log(`Collection ${collection} deleted`);
    } catch(e) {
      console.log(e);
    }
  }
}

export const chromaDB = new ChromaDB();