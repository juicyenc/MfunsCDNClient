Storage library
===

Half-persisitent cache, now written in JS but
will later rewritten in TS and support Intel
ARE Memory.

Proposed Interface
---

```typescript
interface IObjectStorage {
    readFile(sha256: string): Promise<Buffer>
    writeFile(sha256: string, data: Buffer): Promise<void>
}
```
