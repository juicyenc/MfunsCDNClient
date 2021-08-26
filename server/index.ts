import express from 'express';
import { file_handler } from './handler';
import startup from './startup';

const app = express();

startup();

app.use('/f', file_handler);

// fallback
app.use('/', function(req, res){
    res.sendStatus(400);
})


app.listen(8080);