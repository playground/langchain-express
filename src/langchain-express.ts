import { Server } from './server';

let port = 3000;
process.argv.some((argv) => {
  const match = argv.match(/--port=/)
  if(match) {
    port = parseInt(argv.replace(match[0], ''));
  }
})

export class Index {
  server = new Server(port);
  constructor() {
    console.log('start server...')
  }
}

new Index()