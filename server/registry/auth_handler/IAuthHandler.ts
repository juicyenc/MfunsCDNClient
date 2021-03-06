/* eslint-disable no-unused-vars */
export interface IAuthHandler
{
    authenticate(config: /* IConfig */any): Promise<boolean>;

    get_token(): Promise<string>;
}
