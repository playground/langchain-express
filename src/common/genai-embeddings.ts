import { Observable } from "rxjs";
import { EmbeddingVersion, ModelID } from "./models";

export class GenAIEmbeddings {
  url: string;
  constructor(private apiKey: string, private model = ModelID['all-minilm-l6-v2']) {
    this.url = `${process.env.GENAI_API}/v2/text/embeddings?version=${EmbeddingVersion['2023-11-22']}`
  }
  public async generate(texts: string[]): Promise<number[][]> {
    // do things to turn texts into embeddings with an api_key perhaps
    return new Promise((resolve, reject) => {
      this.post(this.url, {model_id: this.model, input: texts})
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