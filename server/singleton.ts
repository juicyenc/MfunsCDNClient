import { MemoryCache } from './cache/MemoryCache';
import { IObjectStorage } from './storage/IObjectStorage';
import { FSStorage } from './storage/FSStorage';
import { RegisterService } from './registry/service';

import * as path from 'path';

export var memoryCache: MemoryCache;

export var diskCache: FSStorage;

export var register: RegisterService;

export function init()
{
    diskCache = new FSStorage(
        path.join(__dirname, 'static')
    );

    memoryCache = new MemoryCache(diskCache);
}

export function init_register(configure: any)
{
}
