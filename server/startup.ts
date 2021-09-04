import { ServerConfig } from './config/ServerConfig';
import * as singleton from './singleton';

export default function startup(configure: ServerConfig)
{
    singleton.init_register(configure);

    singleton.init();
}