import { describe, it } from 'mocha'
import * as path from 'path';
import * as fs from 'fs';

import { exit } from 'process';

import { FSStorage } from './FSStorage';

describe("Filesystem storage test", () => {
    it("should be able to write and read file", (done) => {
        var tmp_path = path.join(__dirname,'mp');
        var storage = new FSStorage(tmp_path);
        var buffer = Buffer.alloc(10);
    
        fs.rmdirSync(tmp_path, {
            recursive: true
        });
        fs.mkdirSync(tmp_path);
        storage.pollute_dir().then(() => {
            buffer.write("abcde", "ascii");
            return storage.write_file("2b2b4b2b", buffer);
        }).then(() => {
            return storage.read_file("2b2b4b2b");
        }).then(() => {
            fs.rmdirSync(tmp_path, {
                recursive: true
            });
            done();
        });
    });
})