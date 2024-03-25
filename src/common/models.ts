export const ModelID = {
  'slate.30m.english.rtrvr': 'ibm/slate.30m.english.rtrvr',
  'slate.30m.english.rtrvr.02.28.2024': 'ibm/slate.30m.english.rtrvr.02.28.2024',
  'slate.125m.english.rtrvr': 'ibm/slate.125m.english.rtrvr',
  'all-minilm-l6-v2': 'sentence-transformers/all-minilm-l6-v2',
  'bge-large-en-v1.5': 'baai/bge-large-en-v1.5',
  'multilingual-e5-large': 'intfloat/multilingual-e5-large',
  mixtral_8x7b_instruct_v01_q: 'ibm-mistralai/mixtral-8x7b-instruct-v01-q',
  llama_2_13b_chat: 'meta-llama/llama-2-13b-chat'
};

export const EmbeddingVersion = {
  '2023-11-22': '2023-11-22'
}

export interface IParam {
  collectionName: string;
}

export const EmbeddingMetadata = {
  cosineSimilarity: {'hnsw:space': 'cosine'},
  innerProduct: {'hnsw:space': 'ip'},
  squaredL2: {'hnsw:space': 'l2'}
}

export const Parameters = {
  maxNewTokens: 'max_new_tokens',
  minNewTokens: 'min_new_tokens',
  decodingMethod: 'decoding_method',
  repetitionPenalty: 'repetition_penalty'
}
