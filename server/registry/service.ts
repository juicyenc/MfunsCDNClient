import { ServerConfig } from '../config/ServerConfig';
import { IAuthHandler } from './auth_handler/IAuthHandler';

import CDN from 'request/dist/lib';

export class RegisterService
{

    readonly cdnDownloader: CDN;

    private authenticated: boolean = false;

    constructor(
        private config: ServerConfig,
        public readonly authHandler: IAuthHandler
    )
    {
        this.cdnDownloader = new CDN(
            new URL(this.config.centralEndpoint)
        );
    }

    async authenticate(): Promise<boolean>
    {
        var result = await this.authHandler.authenticate(this.config);
        this.authenticated = result;
        return this.authenticated;
    }


    async get_file(hash: string): Promise<Buffer>
    {
        if(!this.authenticated)
        {
            return Promise.reject("Not authenticated");
        }

        return Buffer.from(await this.cdnDownloader.get(hash));
    }
}