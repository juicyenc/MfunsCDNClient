import { NextFunction, Request, Response } from 'express';

import * as singleton from './singleton';

/** sha256 string checker
 * @abstract checks if a string is a sha256 string
 * 
 * @param hash string to check
 * @returns if hash is a sha256 string
 */
function sha256_check(hash: string): boolean
{
    const SHA256_LEN = 64;
    const ASCII_0 = 48;
    const ASCII_a =  97;
    hash = hash.toLowerCase();
    if(hash.length != SHA256_LEN) return false;
    for(let i = 0; i < hash.length; i++)
    {
        let ch: number = hash.charCodeAt(i);
        if(
            (ch < ASCII_0 || ch > ASCII_0 + 9) &&
            (ch < ASCII_a || ch > ASCII_a + 5)
        ) return false;

    }
    return true;
}

/** function file_handler(req,res,next)
 * @abstract express handler to handle file request,
 * check if the path is sha1, if not passthrough,
 * else serve the file from cache.
 */
export function file_handler(
    req: Request,
    res: Response,
    next: NextFunction)
{
    // check path format
    let path = req.path;
    // remove preceeding slash
    path = path.substr(1);
    if(!sha256_check(path))
    {
        next();
        return;
    }
    
    // authorization check

    // get from cache
    singleton.memoryCache.read_file(path).then(
        (buf) =>
        {
            res.status(200)
                .send(buf)
                .end();
        }
    )
        .catch(
            async () => 
            {
                //If there is some error, then fetch the file
                var file_buf = await singleton.register.get_file(path);
                singleton.memoryCache.write_file(path, file_buf);
                res.status(200).send(file_buf)
                    .end();
            }
        )
}
