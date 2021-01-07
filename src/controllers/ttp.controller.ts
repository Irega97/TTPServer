import {Request, Response } from 'express';
import { RSA as classRSA } from "../rsa/rsa";
import { bigintToHex, hexToBigint } from 'bigint-conversion';
import { PublicKey } from '../rsa/pubKey';
const bc = require('bigint-conversion');
const sha = require('object-sha');
const axios = require('axios');

let rsa = new classRSA;
let keyPair: any;
let pkp: any;
let pko: any;
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
    //Nuevos datos
    let bodyA = { //Mensaje para el TTP
      type: 4, 
      src: 'TTP', 
      dst: 'A', 
      timestamp: Date.now()
    };

    let bodyB = {
        type: 4,
        src: 'TTP',
        dst: 'B',
        key: body.key, 
        /* iv: bc.bufToHex(body.iv), */
        timestamp: Date.now() 
    }

    //Hasheamos y firmamos el mensaje
    await digest(bodyA).then((data) => {
      let y = keyPair.privateKey.sign(bc.hexToBigint(data));
      pkp = bc.bigintToHex(y)
    });

    //Preparamos nuevos datos
    let jsonA = {
      body: bodyA, //Mensaje para TTP
      signature: pkp //Body para TTP firmado por el cliente
    }; 

    await digest(bodyB).then((data) => {
        let y = keyPair.privateKey.sign(bc.hexToBigint(data));
        pkp = bc.bigintToHex(y)
      });
    
    let jsonB = {
        body: bodyB, //Mensaje para TTP
        signature: pkp //Body para TTP firmado por el cliente
      }; 
      axios.post('http://localhost:3000/rsa/ttp', jsonB);
      return res.status(200).json(jsonA); 
  }
  else{
    return res.status(500).json({message: "Internal Server Error"});
  }
}

async function digest(obj: any) {
    return await sha.digest(obj,'SHA-256');
}

async function sendPubKey(req: Request, res: Response){
  let data = {
      pubKey: { //Clave pública del cliente
      e: bc.bigintToHex(keyPair.publicKey.e), 
      n: bc.bigintToHex(keyPair.publicKey.n)
    }
  }
  return res.status(200).json(data);
}

export default {rsaInit, sendKey, sendPubKey}