import { IAuthHandler } from "./IAuthHandler";

/**
 * @class AlwaysTrueAuthHandler
 * @description Do nothing and return success.
 */
export default class AlwaysTrueAuthHandler implements IAuthHandler{
    constructor() { }

    async authenticate(config: any): Promise<boolean>
    {
        return await true;
    }

    async get_token(): Promise<string>
    {
        return await "";
    }
}
