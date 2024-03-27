export const ModelID = {
  slate_30m_english_rtrvr: 'ibm/slate.30m.english.rtrvr',
  slate_30m_english_rtrvr_02_28_2024: 'ibm/slate.30m.english.rtrvr.02.28.2024',
  slate_125m_english_rtrvr: 'ibm/slate.125m.english.rtrvr',
  all_minilm_l6_v2: 'sentence-transformers/all-minilm-l6-v2',
  bge_large_en_v1_5: 'baai/bge-large-en-v1.5',
  multilingual_e5_large: 'intfloat/multilingual-e5-large',
  mixtral_8x7b_instruct_v01_q: 'ibm-mistralai/mixtral-8x7b-instruct-v01-q',
  llama_2_13b_chat: 'meta-llama/llama-2-13b-chat',
  xenova_all_minilm_l6_v2: 'Xenova/all-MiniLM-L6-v2'
};

export const EmbeddingVersion = {
  '2023-11-22': '2023-11-22'
}

export interface IParam {
  collectionName: string;
}

export const EmbeddingMetadata = {
  cosine: {'hnsw:space': 'cosine'},
  dotProduct: {'hnsw:space': 'ip'},
  squaredL2: {'hnsw:space': 'l2'}
}

export const Parameters = {
  maxNewTokens: 'max_new_tokens',
  minNewTokens: 'min_new_tokens',
  decodingMethod: 'decoding_method',
  repetitionPenalty: 'repetition_penalty'
}

export interface IParam {
  collectionName: string;
  chunkSize: number;
  chunkOverlap: number;
  textQuery: string;
  sourceData: any;
  algorithm: string;
}