export declare function putBlob(putUrl: string, blob: XMLHttpRequestBodyInit, callback?: (((res: any) => void) | undefined)): void;
export declare function putFile(putUrl: string, file: File, callback?: (((res: any) => void) | undefined)): void;
export declare function readFile(file: File, toUrl: boolean, callback: (p: string | ArrayBuffer) => void): void;
export declare function receiveParameters<Res>(): Res;
