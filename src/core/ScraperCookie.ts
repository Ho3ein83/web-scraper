export default class ScraperCookie {

    private cookies: Map<string, string> = new Map();

    fromString(header: string): this{
        this.cookies.clear();

        for(const part of header.split(";")){
            const separator = part.indexOf("=");

            if(separator === -1)
                continue;

            const name = part.slice(0, separator).trim();
            const value = part.slice(separator + 1).trim();

            if(name)
                this.cookies.set(name, decodeURIComponent(value));
        }

        return this;
    }

    set(name: string, value: string): this{
        this.cookies.set(name, value);
        return this;
    }

    unset(name: string): this{
        this.cookies.delete(name);
        return this;
    }

    get(name: string): string | undefined{
        return this.cookies.get(name);
    }

    export(): string{
        return Array.from(this.cookies.entries())
                    .map(([name, value]) =>
                             `${name}=${encodeURIComponent(value)}`
                    )
                    .join("; ");
    }

    dump(): void{
        console.log(Object.fromEntries(this.cookies));
    }

    clear(): void{
        this.cookies.clear();
    }

}