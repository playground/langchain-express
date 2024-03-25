import { GenAIChatModel } from "@ibm-generative-ai/node-sdk/langchain";
import { GenAI } from "../genai";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';

import {Document} from '@langchain/core/documents';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
 
export class ChainWeb {
  model: GenAIChatModel;
  prompt: ChatPromptTemplate;
  constructor(private apiKey: string, modelId: string, params = {}) {
    this.initChain(apiKey, modelId, params);
  }

  initChain(apiKey: string, modelId: string, params: any) {
    this.model = new GenAI(apiKey).genAIChatModel(modelId);

    this.prompt = ChatPromptTemplate.fromTemplate(`
      Answer the user's question.
      Context: {context}
      Question: {input}
    `)

  }

  async queryWeb(url: string, input: string) {
    console.log('am i here', input, url)
    const chain = await createStuffDocumentsChain({
      llm: this.model,
      prompt: this.prompt
    })
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    const response = await chain.invoke({
      input,
      context: docs
    })
    console.log(response)
    return response;
  }
  async query(input: string) {
    //const chain = this.prompt.pipe(this.model);
    const chain = await createStuffDocumentsChain({
      llm: this.model,
      prompt: this.prompt
    })

    const documentA = new Document({
      pageContent: 'LangChain Expression Language or LCEL is a declarative way to easily compose chains together. Any chain constructed this way will automatically have full sync, async, and streaming support.'
    })
    const response = await chain.invoke({
      input,
      context: [documentA]
    })
    return response;
  }
}
