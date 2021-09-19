'use strict'
import fs from 'fs';
import path from 'path';

import { IObjectStorage } from './IObjectStorage';

export class FSStorage implements IObjectStorage
{

    base: string;

    constructor(base: string)
    {
        this.base = base;
    }

    pollute_dir(base: string = this.base, depth: number = 2): Promise<any> 
    {
        if(depth === 0) return Promise.resolve();
        let promises = [];
        for(let i = 0; i < (1 << 8); i++)
        {
            let name = i.toString(16).toLowerCase();
            if(1 === name.length) name = `0${name}`;
            name = path.join(this.base, name);
            promises.push(fs.promises.mkdir(name));
            promises.push(this.pollute_dir(name), depth - 1);
        }
        return Promise.all(promises);
    }

    read_file(sha256: string): Promise<Buffer>
    {
        sha256 = sha256.toLowerCase();
        var filepath = path.join(
            this.base,
            sha256.substr(0, 2),
            sha256.substr(2,2),
            sha256.substr(4)
        );
        return fs.promises.readFile(filepath);
    }

    async write_file(sha256: string, data: Buffer): Promise<void>
    {
        sha256 = sha256.toLowerCase();
        var filepath = path.join(
            this.base,
            sha256.substr(0, 2),
            sha256.substr(2),
            sha256.substr(4)
        );
        let fd = await fs.promises.open(
            filepath, fs.constants.O_CREAT | fs.constants.O_WRONLY);
        fd.write(data);
        fd.close();
    }
}
