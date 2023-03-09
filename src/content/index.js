import Message from '../libraries/messages/message';
import * as MessageTypes from '../libraries/messages/messageTypes';
import SdkError from '../libraries/sdkError';
import { respayerUrl } from '../config/env';
/* eslint-disable */
// disconnect
// isConnected
// isPaired
// addEventHandler
// removeEventHandler
// listen
// getVersion
// getIdentity
// login
// getIdentity
// getIdentityFromPermissions
// checkLogin
// getIdentityFromPermissions
// forgetIdentity
// logout
// updateIdentity
// authenticate
// getArbitrarySignature
// getPublicKey
// linkAccount
// hasAccountFor
// suggestNetwork
// requestTransfer
// requestSignature
// createTransaction
// addToken
// identity

const signatureProvider = (payload) => {
  return {
    async getAvailableKeys() {
      const keys = await Message.payload(MessageTypes.REQUEST_AVAILABLE_KEYS, payload).request();
      return keys;
    },

    async sign(transaction) {
      //args
      //  abis
      //  chainId
      //  requiredKeys
      //  serializedTransaction

      const signargs = Object.assign({}, payload);
      //signargs.network = network;
      signargs.transaction = Object.assign({}, transaction);
      //Uint8Array to array
      signargs.transaction.serializedTransaction = Array.from(signargs.transaction.serializedTransaction);
      const result = await Message.payload(MessageTypes.REQUEST_SIGNATURE, signargs).request();
      if (typeof result != 'object') {
        throw new SdkError.maliciousEvent();
      }
      if (result.isError) {
        throw result;
      }      
      // const signBuf = Buffer.concat([
      //   new Buffer(chainId, "hex"), new Buffer(serializedTransaction), new Buffer(new Uint8Array(32)),
      // ]);
      
      // const signatures = requiredKeys.map(
      //   (pub) => ecc.Signature.sign(signBuf, ecc.PublicKey.fromString(pub).toString()).toString(),
      // );
      return {
        signatures: [ result.signature ],
        serializedTransaction: transaction.serializedTransaction
      }
    }
  }
}

class Dapp {
  constructor() {
    this.init();
  }

  async getVersion() {
    return await Message.signal(MessageTypes.REQUEST_GET_VERSION).request();
  }

  async init() {
    this.identity = await this.getIdentityFromPermissions();    //save?  storage.local
    document.dispatchEvent(new CustomEvent("metahubLoaded"));
    document.dispatchEvent(new CustomEvent("scatterLoaded"));
    
  }

  async login(networks) {    return await this.getIdentity(networks);
  }

  async hasAccountFor(networks) {    return await Message.payload(MessageTypes.REQUEST_HAS_ACCOUNT_FOR, networks).request();
  }

  async getIdentity(networks) {
    const result = await Message.payload(MessageTypes.GET_IDENTITY, networks).request();
    if (typeof result == 'object' && result.isError) {
      throw result;
    }
    this.identity = result;
    return this.identity;
  }

  useIdentity(id) {  }

  async logout(params) {
    return await this.forgetIdentity(params);
  }

  async forgetIdentity(params) {
    const payload = params ? params : {};
  const result = await Message.payload(MessageTypes.FORGET_IDENTITY, payload).request();
  if (typeof result == 'object' && result.isError) {
      throw result;
    }    this.identity = result;
    return this.identity;
  }

  async getIdentityFromPermissions() {
    return await Message.signal(MessageTypes.GET_IDENTITY_FROM_PERMISSIONS).request();
  }

  async suggestNetwork() {  }

  async authenticate(payload) {  }

  async getArbitrarySignature(publicKey, data) {
    const payload = { publicKey, data }
    const result = await Message.payload(MessageTypes.REQUEST_ARBITRARY_SIGNATURE, payload).request();
    if (typeof result == 'object' && result.isError) {
      throw result;
    }
    return result.signature;
  }

  async requestRawAbi(account, chainId) {
    const payload = { account, chainId }
    const result = await Message.payload(MessageTypes.REQUEST_RAW_ABI, payload).request();
    if (typeof result == 'object' && result.isError) {
      throw result;
    }
    return result;
  }

  async requestRequiredKeys(transaction, availableKeys) {
    const payload = { transaction, availableKeys }
    const result = await Message.payload(MessageTypes.REQUEST_REQUIRED_KEYS, payload).request();
    if (typeof result == 'object' && result.isError) {
      throw result;
    }
    return result;
  }

  //eosHook
  eos(network, Eos, options) {    if (options && options.rpc) {
      return this.eos2(network, Eos, options);
    } else {
      return this.eos1(network, Eos, options);
    }
  }

  eosHook(network) {    return signatureProvider({ chainId: network.chainId });
  }

  eos1(network, Eos, options) {    if (typeof options == 'undefined' || options == null) {
      options = {};
    }
    const me = this;
    options.signProvider = async function(signargs) {
      if (this.chainId) {
        signargs.chainId = this.chainId;
      }
      const result = await Message.payload(MessageTypes.REQUEST_SIGNATURE, signargs).request();
      if (typeof result != 'object') {
        throw new SdkError.maliciousEvent();
      }
      if (result.isError) {
        throw result;
      }      return result.signature;
    }
    //todo 使用默认节点
    if (!options.httpEndpoint) {
      options.httpEndpoint = network.protocol + '://' + network.host + (network.port == 80 || network.port == 443 ? '' : ':' + network.port);
    }
    if (!options.chainId) {
      options.chainId = network.chainId;
    }    return Eos(options);
  }

  eos2(network, Api, options) {    // const api = chain.get(network.chainId);
    const chainId = options.chainId ? options.chainId : network.chainId;
    options.chainId = chainId;
    options.signatureProvider = signatureProvider({ chainId });
    options.abiProvider = {
      getRawAbi: async (accountName) => {
        const rawAbi = await this.requestRawAbi(accountName, chainId);
        // reset abi
        rawAbi.abi = Uint8Array.from(Object.values(rawAbi.abi));
        return rawAbi;
      }
    };
    options.authorityProvider = {
      getRequiredKeys: async ({ transaction, availableKeys }) => {
        return await this.requestRequiredKeys(transaction, availableKeys);
      } 
    }
    const api = new Api(options);
    
    // function readUint32( tid, data, offset ){
    //   var hexNum = data.substring(2*offset+6,2*offset+8) + data.substring(2*offset+4,2*offset+6) + data.substring(2*offset+2,2*offset+4) + data.substring(2*offset,2*offset+2);
    //   var ret = parseInt(hexNum,16).toString(10);
    //   return parseInt(ret);
    // }

    function reverseHex(h) {
      return h.substr(6, 2) + h.substr(4, 2) + h.substr(2, 2) + h.substr(0, 2);
    };

    const timePointSecToDate = (ms) => {
      const s = (new Date(ms)).toISOString();
      return s.substring(0, s.length - 5);
    };

    const generateTapos = async (transaction, expireSeconds) => {
      // console.log('ref_block_prefix:', readUint32(8, '0de1d540861633fbd37ca0fee64edb6e28b929dabfcbf1a0eb837e6ed107f45b', 8));+ expireSeconds));
      if (typeof expireSeconds !== 'number') {
        expireSeconds = 30;
      }

      const { info } = await Message.payload(MessageTypes.REQUEST_CHAIN_INFO, { chainId }).request();
      const ref_block_num = info.head_block_num;
      const ref_block_prefix = parseInt(reverseHex(info.head_block_id.substr(16, 8)), 16);
      return {
        expiration: timePointSecToDate(Date.now() + expireSeconds * 1000),
        ref_block_num: ref_block_num & 0xffff,
        ref_block_prefix: ref_block_prefix,
        ...transaction
      }
    };
    api.oTransact = api.transact;
   
    api.transact = async (transaction, options) => {
      // fill options
      if (typeof options != 'object') {
        options = {};
      }
      const { blocksBehind, useLastIrreversible, expireSeconds, ref_block_num, ref_block_prefix } = options;
      if ((typeof blocksBehind == 'undefined' && typeof useLastIrreversible == 'undefined' && (!ref_block_num || !ref_block_prefix))) {
        transaction = await generateTapos(transaction, expireSeconds);
      }

      const account = transaction.actions[0].authorization[0].actor;
      const smoothMode = await Message.payload(MessageTypes.GET_ACCOUNT_SMOOTH_MODE, { chainId, account }).request(); 
      if (!smoothMode || options.broadcast) {
        return await api.oTransact(transaction, options);
      }

      for (const action of transaction.actions) {
        action.authorization.unshift({ 
          actor: '1stbillpayer',
          permission: 'active'
        });
      }
      options = options || {};
      options.broadcast = false;
      options.sign = true;
      options.authorityProvider = {
        getRequiredKeys: async ({ transaction, availableKeys }) => {
          return await this.requestRequiredKeys(transaction, availableKeys);
        }
      };
      const signedTrx = await api.oTransact(transaction, options);
      const trx = api.deserializeTransaction(signedTrx.serializedTransaction);
      trx.signatures = [ signedTrx.signatures[0] ];

      const data = { signed: JSON.stringify(trx) };
      const url = respayerUrl + '/cpu/pushtx';
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (response && response.status == 200) {
        const data = await response.json();
        if (data && data.result) {
          const serverSignature = data.result.signature;
          const signatures = [ serverSignature, signedTrx.signatures[0] ];
          return api.rpc.push_transaction({
            signatures,
            serializedTransaction: signedTrx.serializedTransaction,
            serializedContextFreeData: signedTrx.serializedContextFreeData
          });
        } else {
          let msg = 'unkonwn error';
          if (data && data.message) {
            msg = data.message;
          }
          if (msg.indexOf('reach free cpu') != -1) {
            msg = 'Your available resources have been exhausted.';
          }          throw new Error(msg);
        }
      } else {
        throw new Error('network error');
      }
    }
    return api;
  }

  

  async requestTransfer() {  }

  async createTransaction() {  }
}

const dapp = new Dapp();
window.metahub = dapp;
window.scatter = dapp;

let checkTime = 200;
function resetScatter() {
  if (typeof window.scatter == 'object' && window.scatter != dapp && typeof window.scatter.getIdentity == 'function') {
    window.scatter = dapp;
  }
  if (checkTime < 10000) {
    checkTime += 200;
  } else {
    checkTime += 1000;
  }
  setTimeout(resetScatter, checkTime);
}
setTimeout(resetScatter, 200);

// const dapp = new Dapp();
// window.scatter = new Proxy(dapp, {
//   get: function get(target, name) {//     return dapp[name];
//   }
// });
