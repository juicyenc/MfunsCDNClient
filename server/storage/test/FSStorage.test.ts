import { describe, it } from 'mocha'
import * as path from 'path';
import * as fs from 'fs/promises';

import { exit } from 'process';

import { FSStorage } from '../FSStorage';

describe("Filesystem storage test", () => {
    it("should be able to write and read file", async function() {
        this.timeout(5 * 1000);
        var tmp_path = path.join(__dirname,'mp');
        var storage = new FSStorage(tmp_path);
        var buffer = Buffer.alloc(10);
    
        await fs.rmdir(tmp_path, {
            recursive: true
        });
        await fs.mkdir(tmp_path);
        await storage.pollute_dir();
        buffer.write("abcde", "ascii");
        await storage.write_file("2b2b4b2b", buffer);
        var buffer2 = await storage.read_file("2b2b4b2b");
        buffer2.forEach((v, i) => {
            if(v !== buffer[i])
            {
                return Promise.reject("Incorrect bit read from file.");
            }
        });
        try
        {
            await fs.rmdir(tmp_path, {
                maxRetries: 5,
                retryDelay: 10,
                recursive: true
            });
            await fs.rmdir(tmp_path, {
                recursive: true
            });
            console.log("cp 4");
            return Promise.resolve();
        }
        finally
        {
            return Promise.resolve();
        }
    });
})