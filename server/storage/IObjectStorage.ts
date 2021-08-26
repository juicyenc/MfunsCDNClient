export interface IObjectStorage {
    read_file(sha256: string): Promise<Buffer>
    write_file(sha256: string, data: Buffer): Promise<void>
}