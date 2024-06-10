"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsencrypt_1 = require("jsencrypt");
function encrypt(encMsg, block, err = undefined) {
    $.get("/security/get-pub-key", res => {
        if (res.status === "success") {
            let encrypt = new jsencrypt_1.JSEncrypt();
            encrypt.setPublicKey(`-----BEGIN RSA PUBLIC KEY-----${res.message}-----END RSA PUBLIC KEY-----`);
            block(encrypt.encrypt((encMsg ? encMsg : JSON.stringify(encMsg))));
        }
        else {
            err?.(res);
        }
    });
}
