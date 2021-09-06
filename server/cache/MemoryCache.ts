import { IObjectStorage } from '../storage/IObjectStorage';
import ProperSkipList from 'proper-skip-list'

class MemObjectBuffer
{
    buf: Buffer;
    last_touch: number;

    static build_from_buf(buf: Buffer): MemObjectBuffer
    {
        return {
            buf,
            last_touch: Date.now()
        };
    }
}

export class MemoryCache implements IObjectStorage
{
    private backend: IObjectStorage;

    private skip_list: ProperSkipList;

    constructor(backend: IObjectStorage)
    {
        this.backend = backend;

        this.skip_list = new ProperSkipList({
            stackUpProbability: 0.5
        });
    }

    read_file(sha256: string): Promise<Buffer>
    {
        if(this.skip_list.has(sha256))
        {
            return new Promise<Buffer>((resolve) => 
            {
                var buf = this.skip_list.find(sha256);
                buf.last_touch = Date.now();
                resolve(buf.buf);
            });
        }
        return this.backend.read_file(sha256).then((buf) => 
        {
            this.skip_list.upsert(sha256,
                MemObjectBuffer.build_from_buf(buf))
            
            return buf;
        })
    }

    write_file(sha256: string, data: Buffer): Promise<void>
    {
        this.skip_list.upsert(sha256,
            MemObjectBuffer.build_from_buf(data));
        
        return this.backend.write_file(sha256, data);
    }
}
