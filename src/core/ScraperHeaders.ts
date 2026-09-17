export default class ScraperHeaders {

    #headers = new Map<string, string>();

    constructor(){

    }

    fromString(headerString: string): this{
        this.clear();
        for(const line of headerString.split("\n")){
            const match = line.match(/^([a-zA-Z0-9-]+):\s*(.*)$/);
            if(match){
                const name = match[1],
                    value = match[2];
                if(name)
                    this.#headers.set(name, value);
            }
        }
        return this;
    }

    set(headerName: string, headerValue: string): this{
        this.#headers.set(headerName, headerValue);
        return this;
    }

    unset(headerName: string): this{
        this.#headers.delete(headerName);
        return this;
    }

    get(headerName: string): string | null{
        return this.#headers.get(headerName) ?? null;
    }

    export(): object{
        const header: { [key: string]: string } = {};
        this.#headers.forEach((value: string, key: string) => header[key] = value);
        return header;
    }

    dump(): this{
        console.log(this.export());
        return this;
    }

    clear(): this{
        this.#headers = new Map();
        return this;
    }

}