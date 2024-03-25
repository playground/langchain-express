import { GenAIChatModel, GenAIModel } from '@ibm-generative-ai/node-sdk/langchain'
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ModelID } from '../models';
import { GenAI } from 'src/common/genai';
import { } from 'langchain/agents';

export class AgentOne {
  model: GenAIChatModel;
  constructor(private apiKey: string, modelId: string, params = {}) {
    this.initAgent(apiKey, modelId, params);
  }

  initAgent(apiKey: string, modelId: string, params: any) {
    this.model = new GenAI(apiKey).genAIChatModel(modelId, params);

    const prompt = ChatPromptTemplate.fromMessages([
      //('system', 'Your are a helpful assistant called Max'),
      //('human', 
    ])
  }
}
