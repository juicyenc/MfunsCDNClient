import axios, { AxiosInstance } from "axios";

export interface NextHopResult {
    url: string,
    isLastHop: boolean // always true at present.
}

export default class CDN {

    private readonly headers = { }

    constructor(private centralEndpoint: URL)
    {
    }

    async get(id: string,
        onDownloadProgress: (any) => any): Promise<ArrayBuffer>
    {
        var url = this.get_central_url(id);
        var nextHop: NextHopResult;
        do
        {
            nextHop = await this.get_next_hop(url);
        }while(!nextHop.isLastHop)
        return this.get_file(url, onDownloadProgress);
    }

    private get_central_url(id: string): string
    {
        let pathname = this.centralEndpoint.pathname.concat('/f/', id);
        let url = new URL(this.centralEndpoint);
        url.pathname = pathname;
        return url.toString();
    }

    private async get_file(
        url: string,
        onDownloadProgress: (any)=>any): Promise<ArrayBuffer>
    {
        return await axios.get(url,{
            responseType: 'arraybuffer',
            onDownloadProgress,
        })
    }

    private async get_next_hop(endpoint: string): Promise<NextHopResult>
    {
        let result = await axios.get(endpoint, {
            headers: this.headers,
            responseType: 'json'
        });
        
        let urls = result.data.urls ?? [];

        return {
            url: urls[Math.floor(Math.random() * urls.length)],
            isLastHop: result.data.lastHop ?? true
        };
    }
}