type ctor = new (...args:any[])=> {};

export function Singleton<T extends ctor>(constructor: T)
{
    console.log(constructor.toString());
    return constructor;
}

export function Provide<T extends ctor>(constructor: T)
{
    return constructor;
}
