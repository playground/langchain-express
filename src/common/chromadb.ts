import { ChromaClient, IncludeEnum } from 'chromadb';
//import { Client } from '@ibm-generative-ai/node-sdk';
import { Chroma, ChromaLibArgs } from '@langchain/community/vectorstores/chroma';
import { RetrievalQAChain } from 'langchain/chains';
import { EmbeddingMetadata } from './models';

export class ChromaDB {
  client: ChromaClient;
  //bamClient: Client;

  constructor(private chromaUrl = process.env.CHROMA_URL ) {
    this.client = new ChromaClient({path: chromaUrl});
    //this.bamClient = new Client({ endpoint: process.env.GENAI_API, apiKey: process.env.GENAI_KEY });
    //this.client = new ChromaClient({path: chromaUrl, auth: { provider: "basic", credentials: "admin:admin" }});
  }
  async query(collection: string, input: string, embeddings: any, metadata: any) {
    const vectorStore = await this.getVectorStorefromExistingCollection(collection, embeddings, metadata) ;
    const data = await vectorStore.similaritySearch(input);
    return data;
  }
  async getVectorStorefromExistingCollection(collection: string, embeddings: any, metadata: any = EmbeddingMetadata.cosine) {
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: collection,
      url: this.chromaUrl,
      collectionMetadata: metadata
    });
    return vectorStore;
  }
  async retrieveQAChain(collection: string, input: string, embeddings: any, model: any, metadata: any = EmbeddingMetadata.cosine) {
    const vectorStore = await this.getVectorStorefromExistingCollection(collection, embeddings, metadata);
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const response = await chain.invoke({query: input});
    return response;
  }
  async saveFromDocuments(collection: string, chunks: any, embeddings: any, metadata: any) {
    const vectorStore = await Chroma.fromDocuments(
      chunks,
      embeddings,
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
    } catch(err) {
      console.log(err);
    }
  }
  async getCollection(collection: string) {
    try {
      const col = await this.client.getCollection({name: collection});
      return col;
    } catch(err) {
      console.log(err);
    }
  }
  async getCollectionData(collection: string) {
    try {
      const col = await this.client.getCollection({name: collection});
      const data = await col.get({
        include: [IncludeEnum.Documents, IncludeEnum.Embeddings, IncludeEnum.Metadatas]
      })
      return data;
    } catch(err) {
      console.log(err);
    }
  }
  async deleteCollection(collection: string) {
    try {
      await this.client.deleteCollection({name: collection});
      const res = `Collection ${collection} deleted`;
      console.log(res);
      return res;
    } catch(err) {
      console.log(err);
      return err;
    }
  }
}

export const chromaDB = new ChromaDB();