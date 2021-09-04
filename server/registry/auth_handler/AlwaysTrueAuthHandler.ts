import { IAuthHandler } from "./IAuthHandler";

/**
 * @class AlwaysTrueAuthHandler
 * @description Do nothing and return success.
 */
export default class AlwaysTrueAuthHandler implements IAuthHandler{
    constructor() { }

    async authenticate(config: any): Promise<boolean>
    {
        return true;
    }

    async get_token(): Promise<string>
    {
        return "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiIwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjMwNzcyODUyfQ";
    }
}
