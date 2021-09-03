import { IAuthHandler } from "./IAuthHandler";

/**
 * @class AlwaysFalseAuthHandler
 * @description Do nothing and return failed.
 */
export default class AlwaysFalseAuthHandler implements IAuthHandler{
    constructor() { }

    async authenticate(config: any): Promise<boolean>
    {
        return await false;
    }

    async get_token(): Promise<string>
    {
        return await "";
    }
}
