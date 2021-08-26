import { describe, it } from 'mocha'
import * as path from 'path';
import * as fs from 'fs';

import { exit } from 'process';

import { FSStorage } from '../storage/FSStorage';

    var tmp_path = path.join(__dirname,'mp');
    console.log(tmp_path);
    fs.mkdirSync(tmp_path);
    var storage = new FSStorage(tmp_path);
        let buffer = Buffer.alloc(10);
        buffer.write("abcde", "ascii");
        console.log("before write");
        storage.write_file("2b2b4b2b", buffer).then(()=>{
            console.log("before read");
        storage.read_file("2b2b4b2b").then(() => {
            exit(0);
        })})