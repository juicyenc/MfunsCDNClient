import { IObjectStorage } from '../storage/IObjectStorage';
import SkipList from './SkipList';

export class MemoryCache implements IObjectStorage
{
    private backend: IObjectStorage;

    private skip_list: SkipList;

    constructor(backend: IObjectStorage)
    {
        this.backend = backend;

        this.skip_list = new SkipList();
    }

    async read_file(sha256: string): Promise<Buffer>
    {
        try
        {
            return await this.skip_list.get(sha256);
        }
        catch
        {
            // not found in cache
            var buf = await this.backend.read_file(sha256);
            this.skip_list.insert(sha256, buf);
            return buf;
        }
    }

    write_file(sha256: string, data: Buffer): Promise<any>
    {
        var promise = this.skip_list.insert(sha256, data);
        
        return Promise.all([
            promise,
            this.backend.write_file(sha256, data)
        ])
    }
}
