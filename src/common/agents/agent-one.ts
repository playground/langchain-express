import { GenAIChatModel, GenAIModel } from '@ibm-generative-ai/node-sdk/langchain'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { GenAI } from 'src/common/genai';
import { SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { InitializeAgentExecutorOptions } from 'langchain/agents';

export class AgentOne {
  model: GenAIChatModel;
  constructor(private apiKey: string, modelId: string, params = {}) {
    this.initAgent(apiKey, modelId, params);
  }

  initAgent(apiKey: string, modelId: string, params: any) {
    this.model = new GenAI(apiKey).genAIChatModel(modelId, params);

    const prompt = ChatPromptTemplate.fromMessages([
      //('system', 'Your are a helpful assistant called Max'),
      //('human', '{input}'),
      //new MessagesPlaceholder('agent_scratchpad'),
    ])
  }

  async execute(query: string) {
    const tools = [new Calculator(), new SerpAPI()];
    //const executor = await initializeAgentExecutorWithOptions(tools, this.model, {
    //  agentType: 'openai-functions',
    //  verbose: false
    //})
  }
}

