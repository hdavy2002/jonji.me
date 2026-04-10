declare module 'argon2-browser' {
  export const ArgonType: {
    Argon2d: 0;
    Argon2i: 1;
    Argon2id: 2;
  };

  export interface Argon2HashOptions {
    pass: string;
    salt: Uint8Array;
    type: 0 | 1 | 2;
    mem: number;
    iterations: number;
    hashLen: number;
    parallelism: number;
  }

  export interface Argon2HashResult {
    hash: ArrayBuffer;
    hashHex: string;
    encoded: string;
  }

  export interface Argon2VerifyOptions {
    pass: string;
    encoded: string;
  }

  function hash(opts: Argon2HashOptions): Promise<Argon2HashResult>;
  function verify(opts: Argon2VerifyOptions): Promise<void>;

  export default { hash, verify, ArgonType };
}
