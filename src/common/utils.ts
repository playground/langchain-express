import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync } from 'fs';
import * as http from 'http';
import { forkJoin, Observable, Subject } from 'rxjs';
import WebSocket from 'ws';
import { OpenAIEmbeddings } from '@langchain/openai';
import { GenAIEmbeddings } from './genai-embeddings';
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from '@langchain/openai';
import 'dotenv/config';
import { chromaDB } from './chromadb';
import { HfInference } from '@huggingface/inference';
//import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLinesLoader, JSONLoader } from 'langchain/document_loaders/fs/json';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Document } from 'langchain/document';
import { ModelID, EmbeddingVersion, EmbeddingMetadata } from './models';

const jsonfile = require('jsonfile');
const cp = require('child_process'),
exec = cp.exec;


export class Utils {
  homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  client: ChromaClient | undefined;
  chromaUrl = process.env.CHROMA_URL;
  docPath = './docs';
  state = {
    server: undefined,
    sockets: [],
  };

  constructor(private server: any, private port: number) {
    this.init()
  }
  init() {
    if(!existsSync(this.docPath)) {
      mkdirSync(this.docPath);
    }
    this.client = new ChromaClient({path: this.chromaUrl});
    this.initWebSocketServer();
    //this.client = new Client({ apiKey: process.env.GENAI_KEY });
  }
  getLoader(path = this.docPath) {
    console.log(path)
    const loader = new DirectoryLoader(path, {
      '.json': (file) => new JSONLoader(file),
      '.txt': (file) => new TextLoader(file),
      '.csv': (file) => new CSVLoader(file),
      '.pdf': (file) => new PDFLoader(file)
    })
    console.log('loader', loader)
    return loader;    
  }
  async saveContent() {
    //const client = new ChromaClient();
  }
  test() {
    console.log('here...', this.docPath)
    return new Observable((observer) => {
      (async() => {
        await chromaDB.getCollections()
        const loader = this.getLoader(`${this.docPath}/test`);
        const chunks = await this.chunkDocs(loader);
          console.log('here...')
        const embeddings = new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_API_KEY}); 
        const vectorStore = await chromaDB.saveFromDocuments('test-data', chunks, embeddings, EmbeddingMetadata.cosineSimilarity);

        observer.next(vectorStore);
        observer.complete();  
      })();
    })
  }
  testHuggingFace2() {
    console.log('here...', this.docPath)
    return new Observable((observer) => {
      (async() => {
        await chromaDB.getCollections()
        const loader = this.getLoader(`${this.docPath}/test`);
        const chunks = await this.chunkDocs(loader);
        //const embeddings = new HuggingFaceTransformersEmbeddings({
        //  modelName: 'Xenova/all-MiniLM-L6-v2'
        //});
        //const vectorStore = await chromaDB.saveFromDocuments('ikigai', chunks, embeddings, EmbeddingMetadata.innerProduct);
        //console.log(vectorStore)
        observer.next('');
        observer.complete();  
      })();
    })
  }
  testHuggingFace() {
    return new Observable((observer) => {
      (async() => {
        const hf = new HfInference(process.env.HF_TOKEN);
        const res1 = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: "The Blue Whale is the heaviest animal in the world"
        })
        const res2 = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: "George Orwell wrote 1984"
        })
        const res3 = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: "Random stuff"
        })
        const text_arr = ["The Blue Whale is the heaviest animal in the world", "George Orwell wrote 1984", "Random stuff"]
        const res_arr = [res1, res2, res3]
        const question = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: "What is the heaviest animal?"
        })
        const sims = [];
        for (var i=0;i<res_arr.length;i++){
          // @ts-ignore
          sims.push(this.dotProduct(question, res_arr[i]))
        }
        const max = sims.reduce((a,b) => a>b ? a : b)
        console.log(res1, res2, res3)
        console.log('here', max)
        const response = text_arr[sims.indexOf(max)];
        console.log(response)
        observer.next(response);
        observer.complete();  
      })();
    })
  }
  async chunkDocs(loader: DirectoryLoader) {
    const docs = await loader.load();
    //console.log(docs)
    const pageContent = docs.map((doc) => doc.pageContent);
    console.log(pageContent)
    const textSplitter =  new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 180
    })
    const splitContent = await textSplitter.createDocuments(pageContent);
    console.log('typeof', typeof splitContent, splitContent)
    return splitContent;
  }
  getCollectionData(collection: string) {
    return new Observable((observer) => {
      (async() => {
        const data = await chromaDB.getCollectionData(collection);
        observer.next(data);
        observer.complete();
      })();
    })
  }
  ask(collection: string, query: string) {
    return new Observable((observer) => {
      (async() => {
        const embeddings = new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_API_KEY}); 
        const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
        const data = await chromaDB.retrieveQAChain(collection, query, embeddings, model);
        observer.next(data);
        observer.complete();
      })();
    })
  }
  askOpen(collection: string, query: string) {
    return new Observable((observer) => {
      (async() => {
        const hf = new HfInference(process.env.HF_TOKEN);
        const output = await hf.featureExtraction({
          model: 'intfloat/e5-small-v2',
          inputs: query
        })
        const embeddings = new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_API_KEY}); 
        const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
        const data = await chromaDB.retrieveQAChain(collection, query, embeddings, model);
        observer.next(data);
        observer.complete();
      })();
    })
  }
  saveCollection(loader: DirectoryLoader) {
    return new Observable((observer) => {
      (async() => {
        try {
          //const chunks = this.chunkDocs(loader);
          const docs = await loader.load();
          let text = [];
          let id = [];
          let split: string[] = [];
          docs.forEach((doc) => {
            split = doc.pageContent.split('\n') 
            text.push()
          })
          //const vectorStore = await chromaDB.saveVectorStore('test-data', chunks);
          observer.next('');
          observer.complete();  
        } catch(e) {
          observer.error(e);
        }
      })();
    });  
  }
  test2() {
    console.log('here...', this.docPath)
    return new Observable((observer) => {
      (async() => {
        await chromaDB.getCollections();

        const loader = this.getLoader(`${this.docPath}/test`);
        console.log('here...')
        const embedded = this.chunkDocs(loader);
        console.log(embedded)
        const header = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GENAI_KEY}`
        };
        const body = {
          model_id: ModelID['all-minilm-l6-v2'],
          input: embedded
        };
        const url = `${process.env.GENAI_API}/v2/text/embeddings?version=${EmbeddingVersion['2023-11-22']}`
        let result: any;
        this.post(url, body, header)
        .subscribe({
          next: (res) => {
            result = res;
          }, complete: () => {
            console.log(result);
            observer.next('');
            observer.complete();
          }, error: (err) => observer.error(err)
        })  
      })();
    })
  }

  dotProduct(a: number[], b: number[]) {
    if (a.length !== b.length) {
      throw new Error('Both arguments must have the same length');
    }
  
    let result = 0;
  
    for (let i = 0; i < a.length; i++) {
      result += a[i] * b[i];
    }
  
    return result;
  }
  // Define the function to calculate cosine similarity
  cosineSimilarity(A: any, B: any): number {
    // Initialize the sums
    let sumAiBi = 0, sumAiAi = 0, sumBiBi = 0;

    // Iterate over the elements of vectors A and B
    for (let i = 0; i < A.length; i++) {
        // Calculate the sum of Ai*Bi
        sumAiBi += A[i] * B[i];
        // Calculate the sum of Ai*Ai
        sumAiAi += A[i] * A[i];
        // Calculate the sum of Bi*Bi
        sumBiBi += B[i] * B[i];
    }

    // Calculate and return the cosine similarity
    return 1.0 - sumAiBi / Math.sqrt(sumAiAi * sumBiBi);
  }
  post(url: string, body: any, header = {'Content-Type': 'application/json'}) {
    return new Observable((observer) => {
      const raw = JSON.stringify(body);
      const headers = new Headers(header);
      const options: any = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
      }
      fetch(url, options)
      .then((response) => response.text())
      .then((result) => {
        observer.next((result));
        observer.complete();
      })
      .catch((e) => {
        console.log(e);
        observer.error(e);
      })
    })
  }
  initWebSocketServer() {
    // Creating a new websocket server
    const wss = new WebSocket.Server({server: this.server})
    
    // Creating connection using websocket
    wss.on("connection", ws => {
      console.log("new client connected", ws._socket.remoteAddress);
      // sending message
      ws.on("message", data => {
        console.log(`Client has sent us: ${data}\n`)
        try {
          let input = JSON.parse(data);
          console.log(input.from)
        } catch(e) {
          console.log('JSON parse error...', data)          
        }
      });
      // handling what to do when clients disconnects from server
      ws.on("close", () => {
        console.log("the client has disconnected");
      });
      // handling client connection error
      ws.onerror = function () {
        console.log("Some Error occurred")
      }
    });
    require('dns').lookup(require('os').hostname(), (err, add, fam) => {
      console.log(`The WebSocket server is running on ${add}:${this.port}`);
    })
    this.state.server = this.server.listen(this.port, () => {
      console.log(`Started on ${this.port}`);
    });
    // @ts-ignore
    this.state.server.on('connection', (socket) => {
      //this.state.sockets.forEach((socket, index) => {
      //  if (socket.destroyed === false) {
      //    socket.destroy();
      //  }
      //});
      //this.state.sockets = []
      //this.state.sockets.push(socket);
      //console.log('Socket added: ', this.state.sockets.length)
    })
  }
}  