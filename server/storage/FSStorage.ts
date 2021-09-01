'use strict'
import fs from 'fs';
import path from 'path';

import { IObjectStorage } from './IObjectStorage';

export class FSStorage implements IObjectStorage {

    base: string;

    constructor(base: string)
    {
        this.base = base;
    }

    pollute_dir(): Promise<any> 
    {
        let promises = [];
        for(let i = 0; i < (1 << 8); i++)
        {
            let name = i.toString(16).toLowerCase();
            if(name.length === 1) name = '0' + name;
            name = path.join(this.base, name);
            promises.push(fs.promises.mkdir(name));
        }
        return Promise.all(promises);
    }

    read_file(sha256: string): Promise<Buffer>
    {
        sha256 = sha256.toLowerCase();
        var filepath = path.join(
            this.base,
            sha256.substr(0,2),
            sha256.substr(2)
        );
        return fs.promises.readFile(filepath);
    }

    write_file(sha256: string, data: Buffer): Promise<void>
    {
        sha256 = sha256.toLowerCase();
        var filepath = path.join(
            this.base,
            sha256.substr(0,2),
            sha256.substr(2)
        );
        return fs.promises.open(filepath, fs.constants.O_CREAT | fs.constants.O_WRONLY).then((fd) => {
            return fd.write(data);
        }).then(()=>{
            return;
        });
    }
}
