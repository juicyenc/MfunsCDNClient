import { Mutex, MutexInterface } from 'async-mutex';


class CacheData 
{
    lastAccess: number;
    value?: Buffer;
}

class CacheNode 
{
    key?: string;
    data: CacheData;
    nodeType: "value" | "head" | "tail";
    readLock: Mutex;

    next?: CacheNode;
    pre?: CacheNode;
    up?: CacheNode;
    down?: CacheNode;
}

export default class CacheSkipList 
{

    // heads and tails
    private heads: CacheNode[];
    private tails: CacheNode[];

    constructor(
        public readonly timeout = 5000,
        public lowDownTime = 5 * 60 * 1000 /* 5 min */,
        public readonly level = 5
    ) 
    {
        setInterval(this.clean, this.timeout);
        this.init_list();
    }

    /**
     * @method init_list Initialize skip list
     */
    private init_list() 
    {
        this.heads = new Array();
        this.tails = new Array();
        for (let i = 0; i < this.level; i++) 
        {
            let headNode: CacheNode = {
                nodeType: "head",
                data: {
                    lastAccess: Date.now()
                },
                readLock: new Mutex()
            };

            let tailNode: CacheNode = {
                nodeType: "tail",
                data: {
                    lastAccess: Date.now()
                },
                readLock: new Mutex(),
                pre: headNode
            }

            headNode.next = tailNode;

            this.heads.push(headNode);
            this.tails.push(tailNode);
        }

        for (let i = 1; i < this.level; i++) 
        {
            this.heads[i - 1].down = this.heads[i];
            this.tails[i - 1].down = this.tails[i];
        }

        for (let i = this.level - 1; 0 < i; i--) 
        {
            this.heads[i].up = this.heads[i - 1];
            this.tails[i].up = this.tails[i - 1];
        }
    }

    private async get_insert_point(
        key: string,
        cur: CacheNode[]): Promise<void> 
    {
        var curLevel = 0;
        while (
            "value" != cur[curLevel].nodeType &&
            cur[curLevel].key !== key
        ) 
        {
            if ("value" !== cur[curLevel].nodeType) 
            {
                cur[curLevel] = cur[curLevel].next;
                continue;
            }
            if ("value" === cur[curLevel].nodeType) 
            {
                if (cur[curLevel].key < key) 
                {
                    cur[curLevel] = cur[curLevel].next;
                    continue;
                }
                if (cur[curLevel].key === key) return Promise.reject();
                if (cur[curLevel].key > key) 
                {
                    if (curLevel === this.level - 1) break;

                    // go down
                    cur[curLevel] = cur[curLevel].pre;

                    cur[curLevel + 1] = cur[curLevel].down;
                    curLevel++;
                    continue;
                }
            }
        }
    }

    /**
     * @method insert_node insert `CacheNode`s with data
     * @param cur cursor in every level that points to the node
     * before insertion point
     */
    private async insert_node(
        key: string,
        data: CacheData,
        curs: CacheNode[]): Promise<void> 
    {
        var cur: CacheNode;

        var readLock = new Mutex();

        var upNode: CacheNode = undefined;

        for (let i = 0; i < this.level; i++) 
        {
            cur = curs[i];

            let node: CacheNode = {
                key,
                data,
                nodeType: "value",
                readLock,

                up: upNode
            };

            // eslint-disable-next-line no-unused-expressions
            upNode ?? (upNode.down = node);

            node.pre = cur;
            node.next = cur.next;
            (cur.next).pre = node;
            cur.next = node;

            upNode = node;
        }
    }

    /**
     * @method insert
     * @param key the key of cache, usually sha256 value
     * @param buffer cache content
     * 
     * @description Insert content to cache with specific key,
     * if such key has existed, the promise rejects.
     */
    async insert(key: string, buffer: Buffer): Promise<void> 
    {
        /* NOTE
        Note on Insert Strategy

        A new content, that will be inserted into the cache,
        only if when the server is going to serve it but cannot
        find it in the list, where we can assume that this file
        is frequently requested during recent time peroid. So
        the skip list will insert a new cache on the top line
        to ensure performance for frequent request.
         */
        var cur: CacheNode[] = new Array(this.level);
        for (let i = 0; i < this.level; i++) cur[i] = this.heads[i];

        this.get_insert_point(key, cur);

        var data: CacheData = {
            lastAccess: Date.now(),
            value: buffer
        };

        this.insert_node(key, data, cur);

        data.lastAccess = Date.now();
    }

    /**
     * @method get
     * @param key the key of cache, usually sha256 value
     */
    async get(key: string): Promise<Buffer> 
    {
        var node = await this.get_node(key);
        var buffer = Buffer.alloc(node[0].data.value.length);
        node[0].data.value.copy(buffer);

        (node[1])();

        return buffer;
    }

    /**
     * @method get_node get specific node with key
     * @returns CacheNode and its lock releaser
     * 
     * @note this function will acquire `readLock`
     */
    private async get_node(key: string): 
        Promise<[CacheNode, MutexInterface.Releaser]> 
    {
        var cur = this.heads[0];
        var curLevel = 0;
        while (cur.key !== key) 
        {
            if (cur.key < key) 
            {
                cur = cur.next;
                continue;
            }
            if (cur.key > key || "tail" === cur.nodeType) 
            {
                // go down
                curLevel++;
                if (5 <= curLevel) return Promise.reject();
                cur = (cur.pre).down;
            }
        }
        return [cur, await cur.readLock.acquire()];
    }

    private async remove_node(node: CacheNode): Promise<void> 
    {
        await node.readLock.waitForUnlock();

        var cur = node;

        while (cur.up != undefined) cur = cur.up;

        while (cur.down != undefined) 
        {
            (cur.down).up = undefined;
            (cur.pre).next = cur.next;
            (cur.next).pre = cur.pre;

            cur = cur.down;
        }
        (cur.pre).next = cur.next;
        (cur.next).pre = cur.pre;
        // reference to cur should decreace to 1 and GC will finally collect it.
    }

    /**
     * @method remove
     * @param key the key of cache, usually sha256 value
     * 
     * @description Immediately remove a node, for example
     * to accomplish supervison.
     * 
     * @returns A boolean value, false if does not exists,
     * true if success
     */
    async remove(key: string): Promise<boolean> 
    {
        var node;
        try 
        {
            node = this.get_node(key);
        }
        catch
        {
            return false;
        }
        finally 
        {
            this.remove_node(node);
            // eslint-disable-next-line no-unsafe-finally
            return true;
        }
    }

    /**
     * @method clean Private method to clean-up skip list peroidly.
     */
    private clean() 
    {
        /* NOTE
        Note on Clean Strategy
        
        Some files are not so frequent as time goes by. They
        should be cleaned to improve performance for more
        frequently requested file and save memory.
        
        clean() will run peroidly and check lastAccess
        of every node (on the bottom line), low down
        if this.should_low_down(node). If this node
        only exists on bottom line, clean will remove
        this node and leverage GC to free memory. */
        var cur = this.heads[this.level - 1];
        cur = cur.next;
        while ("tail" !== cur.nodeType) 
        {
            if (this.shoud_low_down(cur)) 
            {
                let upmost = cur;
                while (upmost.up != undefined) upmost = upmost.up;
                (upmost.pre).next = upmost.next;
                (upmost.next).pre = upmost.pre;
                (upmost.down).up = undefined;
            }
            cur = cur.next;
        }
    }

    /**
     * @method should_low_down Decision algorithm if a
     * node should low down.
     */
    protected shoud_low_down(node: CacheNode): boolean 
    {
        return Date.now() - this.lowDownTime > node.data.lastAccess;
    }
}
