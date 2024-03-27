import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import { readFileSync } from 'fs';
import * as http from 'http';
import path from 'path';

import { IParam, Utils } from './common';

declare const process: any;

export class Server {
  app = express();
  utils: Utils;
  constructor(private port = 3000) {
    this.initialise()
  }

  initialise() {
    let app = this.app;
    app.use(cors({
      origin: '*'
    }));
    app.use(fileUpload());
    // Parse URL-encoded bodies (as sent by HTML forms)
    app.use(express.urlencoded());

    // Parse JSON bodies (as sent by API clients)
    app.use(express.json());

    app.use('/static', express.static('public'));

    app.use('/', express.static('dist/mesh-genai'));
  
    app.get('/', (req: express.Request, res: express.Response, next: any) => { //here just add next parameter
      res.sendFile(
        path.resolve(__dirname, "index.html")
      )
      // next();
    })
  
    app.get("/staff", (req: express.Request, res: express.Response) => {
      res.json(["Jeff", "JM", "Steve"]);
    });

    app.get("/test", (req: express.Request, res: express.Response) => {
      this.utils.test()
      .subscribe({
        complete: () => res.send({status: true, message: `done`}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/testHuggingFace", (req: express.Request, res: express.Response) => {
      this.utils.testHuggingFace()
      .subscribe({
        next: (data) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });

    app.get("/getCollections", (req: express.Request, res: express.Response) => {
      this.utils.getCollections()
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/deleteCollection", (req: express.Request, res: express.Response) => {
      this.utils.deleteCollection(req.query.collection as string)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/getCollectionData", (req: express.Request, res: express.Response) => {
      this.utils.getCollectionData(req.query.collection as string)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/ask", (req, res) => {
      this.utils.ask(req.query.collection as string, req.query.query as string)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/askHF", (req, res) => {
      this.utils.askHF(req.query.collection as string, req.query.query as string, this.utils.embedAlgorithm(req.query.alorithm as string))
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/askWeb", (req, res) => {
      this.utils.askWeb(req.query.query as string, req.query.url as string || '')
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.post('/upload', (req: any, res: any) => {
      try {
        console.log(typeof req.files.sourceData, Array.isArray(req.files.sourceData), typeof req.body.input)
        const input: IParam = req.body.input ? JSON.parse(req.body.input) : null;
        const sourceData = req.files.sourceData && Array.isArray(req.files.sourceData) ? req.files.sourceData : req.files.sourceData ? [req.files.sourceData] : [];
        const count = sourceData.length;
        console.log(count, sourceData)
        if (count == 0) {
          return res.status(400).send('No files were uploaded.');
        } else {
          sourceData.forEach((file: any) => {
            const mimetype = file ? file.mimetype : '';
            const regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|pdf|csv|json|txt)$/)
            console.log('type: ', file.mimetype)
            if(regex.test(mimetype)) {
              let uploadPath = `${this.utils.imagePath}/${file.name}`;
              if(mimetype.indexOf('video/') >= 0) {
                let ext = file.name.match(/\.([^.]*?)$/);
                uploadPath = `${this.utils.videoPath}/${file.name}`;
              } else {
                uploadPath = `${this.utils.docPath}/${file.name}`
              }
              
              // Use the mv() method to place the file somewhere on your server
              console.log(uploadPath, process.cwd())
              file.mv(uploadPath, function(err) {
                if (err) {
                  return res.status(500).send(err);                  
                }
              });
            } else {
              res.send({status: true, message: `Only these file types jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|pdf|csv|json|txt are accepted.`});
            }              
          });
          setTimeout(() => {
            if(input) {
              this.utils.embedAndStore(input)
              .subscribe({
                next: (response) => {
                  this.utils.removeFiles(path.join(process.cwd(), `${this.utils.docPath}/*.*`))
                  .subscribe(() => {
                    if(input.textQuery && input.textQuery.length > 0) {
                      this.utils.askHF(input.collectionName, input.textQuery, this.utils.embedAlgorithm(input.algorithm))
                      .subscribe({
                        next: (response: any) => {
                          console.log('response: ', input.textQuery, response)
                          let msg = count > 1 ? {upload: `${count} files uploaded!`} : {upload: `${count} file uploaded!`}
                          msg = Object.assign(msg, response);
                          res.send({status: true, message: msg})
                        },
                        error: (e) => res.send({status: true, message: e})
                      })  
                    } else {
                      const msg = count > 1 ? `${count} files uploaded!` : `${count} file uploaded!` + `\n\n${response}`
                      res.send({status: true, message: msg});        
                    }        
                  })
                },
                error: (err) => res.send({status: false, message: err}) 
              })
            } else {
              const msg = count > 1 ? `${count} files uploaded!` : `${count} file uploaded!`
              res.send({status: true, message: msg});  
            }
  
          }, 800)
        }  
      } catch(err) {
        res.status(500).send(err);
      }
    });
    
    console.log('create server...')
    const server = http.createServer(app);
    //const server = http.createServer({
      //key: readFileSync('star_liquid-prep_org.key'),
      //cert: readFileSync('star_liquid-prep_org.crt') 
    //}, app);
    this.utils = new Utils(server, this.port);
  }
}
