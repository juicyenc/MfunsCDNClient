import { MemoryCache } from './cache/MemoryCache';
import { FSStorage } from './storage/FSStorage';
import { RegisterService } from './registry/service';

import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';
import { ServerConfig } from './config/ServerConfig';
import AuthHandler from './registry/auth_handler/AlwaysTrueAuthHandler';

export var memoryCache: MemoryCache;

export var diskCache: FSStorage;

export var register: RegisterService;

export async function init()
{
    var cwd = process.cwd();

    var staticPath = path.join(cwd, 'static');

    diskCache = new FSStorage(staticPath);

    try
    {
        await fs.promises.stat(staticPath);
    }
    catch(e)
    {
        await fs.promises.mkdir(staticPath);
        await diskCache.pollute_dir();
    }
    finally
    {
        memoryCache = new MemoryCache(diskCache);
    }
}

export function init_register(configure: ServerConfig)
{
    var authHandler = new AuthHandler();

    register = new RegisterService(configure, authHandler);
}
