import {JSEncrypt} from "jsencrypt";

function encrypt(encMsg: string | object, block: (enced: string) => void, err: ((arg0: any) => void) | undefined = undefined){
  $.get("/security/get-pub-key", res => {
    if(res.status === "success") {
      let encrypt = new JSEncrypt();
      encrypt.setPublicKey(`-----BEGIN RSA PUBLIC KEY-----${res.message}-----END RSA PUBLIC KEY-----`);
      block(<string>encrypt.encrypt(<string>(encMsg ? encMsg : JSON.stringify(encMsg))));
    }
    else {
      err?.(res)
    }
  })
}

