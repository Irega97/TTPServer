import {Request, Response } from 'express';
import { RSA as classRSA } from "../rsa/rsa";
import { bigintToHex, hexToBigint } from 'bigint-conversion';
import { PublicKey } from '../rsa/pubKey';
const bc = require('bigint-conversion');
const sha = require('object-sha');
const axios = require('axios');

let rsa = new classRSA;
let keyPair: any;
let pkp;
let po: any;
let message: any;

async function rsaInit(){ //Función que se ejecuta en index.ts
    // GENERA PAR DE LLAVES RSA (public & private)
    console.log("Generando claves . . .")
    keyPair = await rsa.generateRandomKeys();
    console.log("CLAVE PÚBLICA");
    console.log("e: ", rsa.publicKey.e);
    console.log("n: ", rsa.publicKey.n);
    console.log("Claves generadas con éxito!");
}

async function sendKey(req: Request, res: Response){
  let key, iv;
  let body = req.body.body;
  console.log("body: ", req.body);
  let aPubKey = new PublicKey(hexToBigint(req.body.pubKey.e), hexToBigint(req.body.pubKey.n));
  let proofDigest = await bc.bigintToHex(aPubKey.verify(bc.hexToBigint(req.body.signature)));
  let bodyDigest = await digest(body);
  if(bodyDigest.trim() === proofDigest.trim()) {
      pkp = req.body.signature; //Proof public key
      key = body.key; 
      iv = body.iv;
      console.log("Hola")
      console.log("All data verified");
      let data = {
        po: po,
        pkp: pkp,
        key: key,
        iv: iv,
        pubKey: {
          e: bigintToHex(keyPair.publicKey.e),
          n: bigintToHex(keyPair.publicKey.n)
        }
      } 
      console.log(data);
      /* axios.post('http://localhost:3000/rsa/ttp', data); */
      return res.status(200).json(data);
  }
  else{
    return res.status(500).json({message: "Internal Server Error"});
  }
}

async function digest(obj: any) {
    return await sha.digest(obj,'SHA-256');
}

export default {rsaInit, sendKey}