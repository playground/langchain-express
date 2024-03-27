import { Observable } from "rxjs";
import { EmbeddingVersion, ModelID } from "./models";
import { GenAIModel, GenAIChatModel } from '@ibm-generative-ai/node-sdk/langchain';

export class GenAI {
  url: string;
  constructor(private apiKey: string) {
    this.url = `${process.env.GENAI_API}/v2/text/embeddings?version=${EmbeddingVersion['2023-11-22']}`
  }
  genAIModel(modelId: string, params = {}) {
    const model = new GenAIModel({
      modelId: modelId,
      parameters: params,
      configuration: {
        apiKey: this.apiKey,
      },
    });
    return model;    
  }
  genAIChatModel(modelId: string, params = {}) {
    const model = new GenAIChatModel({
      model_id: modelId,
      parameters: params,
      configuration: {
        apiKey: this.apiKey,
      },
    });
    return model;    
  }
  public async generate(texts: string[], model: string): Promise<number[][]> {
    // do things to turn texts into embeddings with an api_key perhaps
    return new Promise((resolve, reject) => {
      this.post(this.url, {model_id: model, input: texts})
      .subscribe({
        next: (res: number[][]) => {
          resolve(res);
        }, error: (e) => reject(e)
      })  
    })
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
}