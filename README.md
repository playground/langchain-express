# Langchain Express 

Explore Neo4J RAG LLM pipeline using IBM BAM `https://bam.res.ibm.com/` with custom chains and agents.

## Development server

Run `npm run watch:deploy` for a dev server. The application will automatically reload if you change any of the source files.  

To interact with Langchain Express Server, head over to `https://github.com/playground/mesh-genai` and clone the repo.  Run `ng serve` for a dev server.  Hit this url `http://localhost:4200/` to bring up the UI.  

Navigate to `Langchain JS` tab:
```
Settings:     Provide Langchain Express URL(ex: http://localhost:3000).
Loader:       Upload documents to be embedded and store in vector db (.pdf, .txt, .json, .csv)
Try Me:
  Ask Me:     Ask questions related to contents that have been uploaded by specifying the collection name
  Ask Web:    Ask questions by crawling the web with the provided url using retrieval chains/tools
  Ask Agent:  Coming soon  
```

## Vector Storage - ChromaDB

`docker run -d --rm --name chromadb -p 8000:8000 -v ./chroma:/chroma/chroma -e IS_PERSISTENT=TRUE -e ANONYMIZED_TELEMETRY=TRUE chromadb/chroma:latest`

## Known issue

To get around this error for the time being
```
Error [ERR_REQUIRE_ESM]: require() of ES Module /home/playground/langchain-express/node_modules/@xenova/transformers/src/transformers.js from /home/playground/langchain-express/node_modules/@langchain/community/dist/embeddings/hf_transformers.cjs not supported.
```

replace line #4 and #82 in `/node_modules/@langchain/community/dist/embeddings/hf_transformers.cjs` with the following to dynamically import "@xenova/transformers"

Line #4
```
const transformers_1 = (async() => {
    return await import('@xenova/transformers')  
  })();
```
Line #82
```
const pipe = await (this.pipelinePromise ??= (await import("@xenova/transformers")).pipeline("feature-extraction", this.modelName));
```

## TODO

Explore Neo4J Knowledge Graph and custom Agents
