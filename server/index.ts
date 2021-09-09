/* eslint-disable no-console */
import express from 'express';
import { file_handler } from './handler';
import startup from './startup';

import { argv, exit } from 'process';
import { readFileSync } from 'fs';

if(3 > argv.length)
{
    console.log("usage:node index.js [config.json]");
    exit(1);
}

let confPath = argv[2];

let conf = JSON.parse(readFileSync(confPath).toString('utf8'));

const app = express();

startup(conf);

app.use('/f', file_handler);

// Fallback
app.use('/', function(req, res)
{
    res.sendStatus(400);
})


app.listen(8080);
