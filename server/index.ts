import express from 'express';
import { file_handler } from './handler';
import startup from './startup';

import { argv, exit } from 'process';
import { readFileSync } from 'fs';

if(argv.length < 3)
{
    console.log("usage:node index.js [config.json]");
    exit(1);
}

let conf_path = argv[2];

let conf = JSON.parse(readFileSync(conf_path).toString('utf8'));

const app = express();

startup(conf);

app.use('/f', file_handler);

// fallback
app.use('/', function(req, res){
    res.sendStatus(400);
})


app.listen(8080);