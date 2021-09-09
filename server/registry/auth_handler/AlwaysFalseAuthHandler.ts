import { IAuthHandler } from "./IAuthHandler";

/**
 * @class AlwaysFalseAuthHandler
 * @description Do nothing and return failed.
 */
export default class AlwaysFalseAuthHandler implements IAuthHandler
{

    async authenticate(): Promise<boolean>
    {
        return false;
    }

    async get_token(): Promise<string>
    {
        return Promise.reject();
    }
}
