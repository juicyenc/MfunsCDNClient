interface ServiceNode {
    instance: any;
    type: "singleton" | ""
}

export class DI {
    
    static default_obj: DI = null;
    
    constructor()
    { }

    static default(): DI
    {
        if(this.default_obj === null)
        {
            this.default_obj = new DI();
        }
        return this.default_obj;
    }
}

var app: DI;

export default app;