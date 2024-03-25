import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import { readFileSync } from 'fs';
import * as http from 'http';
import path from 'path';

import { Utils } from './common';

declare const process: any;

export class Server {
  app = express();
  utils: any;
  constructor(private port = 3000) {
    this.initialise()
  }

  initialise() {
    let app = this.app;
    app.use(cors({
      origin: '*'
    }));
    app.use(fileUpload());

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

    app.get("/getCollectionData", (req: express.Request, res: express.Response) => {
      this.utils.getCollectionData(req.query.collection)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/ask", (req, res) => {
      this.utils.ask(req.query.collection, req.query.query)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/askHF", (req, res) => {
      this.utils.askHF(req.query.collection, req.query.query)
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/askWeb", (req, res) => {
      this.utils.askWeb(req.query.query, req.query.url || '')
      .subscribe({
        next: (data: any) => res.send({status: true, message: data}),
        error: (e) => res.send({status: true, message: e})
      })
    });
    app.get("/interval", (req, res) => {
      this.utils.setTimeInterval(req.query.ms)
      res.send({status: true, message: `Interval: ${req.query.ms}`});
    });
    app.get("/log", (req, res) => {
      res.send({status: 200, timeSeries: this.utils.timeSeries});
    });
    app.get("/score", (req, res) => {
      this.setInteractive();
      this.utils.$score.next({name: 'score', score: req.query.score, assetType: req.query.assetType});
      res.send({status: true, message: `Score: ${req.query.score}`});
    });
    app.get("/model", (req, res) => {
      this.setInteractive();
      this.utils.$model.next({name: 'model', model: req.query.model, assetType: req.query.assetType});
      res.send({status: true, message: `Model: ${req.query.model}`});
    });
    app.post('/upload', (req: any, res: any) => {
      try {
        const count = req.files.upload ? req.files.upload.length : 0;
        if (count == 0) {
          return res.status(400).send('No files were uploaded.');
        } else {
          req.files.upload.forEach((file: any) => {
            const mimetype = file ? file.mimetype : '';
            const regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|pdf|cvs|json|txt)$/)
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
                const msg = count > 1 ? `${count} files uploaded!` : `${count} file uploaded!`
                res.send({status: true, message: msg});
              });
            } else {
              res.send({status: true, message: `Only these file types jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|pdf|cvs|json|txt are accepted.`});
            }              
          });
          let file = req.files.file;
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
  setInteractive = () => {
    process.env.npm_config_lastinteractive = Date.now();
  }
}
