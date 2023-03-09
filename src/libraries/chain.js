import EOS from "./eos";
import store from '../store/index.js'
import { decrypt, encrypt } from '../util/crypto';
import { md5 } from '../util/crypto';
import i18n from './lang'
import errorCode from '../config/errorCode';

export default class Chain {
  static chains = {};

  static getCurrentPrivateKey() {
    if (store.state.wallets.length == 0) {
      return '';
    }
    const account = this.currentAccount();
    return decrypt(account.privateKey, md5(account.seed + store.getters.password));
  }

  static getPrivateKeyByPublicKey(publicKey) {
    for (let index = 0; index < store.state.wallets.length; index++) {
      const wallet = store.state.wallets[index];
      for (const key of wallet.keys) {
        if (key.publicKey === publicKey) {
          return decrypt(key.privateKey, md5(wallet.seed + store.getters.password));
        }
      }
    }
    return false;
  }

  static getPrivateKeyByAuthorization(chainId, authorization) {
    if (typeof authorization == 'string') {
      const as = authorization.split('@');
      authorization = {
        actor: as[0],
        permission: as[1] ? as[1]: 'active'
      }
    }    const wallet = store.state.wallets.find(x => x.chainId === chainId && x.name === actor);
    if (wallet) {
      for (const key of wallet.keys) {
        if (key.permissions.indexOf(authorization.permission) >= 0) {
          return decrypt(key.privateKey, md5(wallet.seed + store.getters.password));
        }
      }
    }
    return false;
  }

  static getPublicKeyByPermission(chainId, actor, permission) {
    const wallet = store.state.wallets.find(x => x.chainId === chainId && x.name === actor);
    if (wallet) {
      for (const key of wallet.keys) {
        if (key.permissions.indexOf(permission) >= 0) {
          return key.publicKey;
        }
      }
    }
    return null;
  }

  static currentAccount() {
    return store.state.wallets[store.state.selectedIndex];
  }

  static get(chainId='') {
    if (chainId == '') {
      chainId = store.state.currentChainId;
    }
    if (typeof this.chains[chainId] == 'undefined') {
      this.chains[chainId] = new EOS(chainId, store.getters.selectedRpc(chainId), this);
    }
    return this.chains[chainId];
  }

  static getAuth() {
    let permission = 'active';
    for (let key of this.currentAccount().keys) {
      if (key.permissions.indexOf('owner') > -1) {
        permission = 'owner';
        break;
      }
    }
    return {
      actor: this.currentAccount().name,
      permission
    }
  }

  static getAuthByAccount(actor, permission) {
    return { actor, permission }
  }

  static getErrorMsg(e) {
    if (e) {
      if (e.json && e.json.error) {
        e = e.json.error;
      }
      if (e.name) {
        if (e.name == 'tx_cpu_usage_exceeded' || e.name == 'leeway_deadline_exception') {
          return i18n.t('public.resourceCPULimit');
        }
        if (e.name == 'tx_net_usage_exceeded') {
          return i18n.t('public.resourceNetLimit');
        }
        if (e.name == 'ram_usage_exceeded') {
          return i18n.t('public.resourceLimitRam');
        }
      }
      if (e.details) {
        const msg =  e.details[0].message;
        if (msg.indexOf('first transfer must be EOS') > -1) {
          return i18n.t('error.firstNeedEOS');
        }
        return msg;
      }
      let msg = e.message;
      if (msg && msg.length < 100) {
        if (msg.indexOf('reach free cpu') != -1) {
          return i18n.t('error.cpuTimeLimit');
        }
        return msg;
      }
    }    return i18n.t('public.requestHttpEndpointTimeout');
  }

  static authorityProvider({ chainId }) {
    return {
      getRequiredKeys: async ({ transaction, availableKeys }) => {
        const permissions = new Set();
        for (let action of transaction.actions) {
          for (let auth of action.authorization) {
            permissions.add(auth.actor + '-' + auth.permission);
          }
        }
        const keys = [];
        for (let permission of permissions) {
          const [ actor, perm ] = permission.split('-');
          const key = this.getPublicKeyByPermission(chainId, actor, perm);
          if (key) {
            keys.push(key);
          }
        }        return keys;
      } 
    };
  }

  static signatureProvider({ chainId }) {
    return {
      async getAvailableKeys() {
        const keys = Chain.currentAccount().keys.map(x => x.publicKey);
        return keys;
      },

      async sign(transaction) { 
        const buffer = Buffer.from(Uint8Array.from(transaction.serializedTransaction), 'hex');
        const payload = {
          buf: Buffer.concat([
            Buffer.from(chainId, "hex"), buffer,  Buffer.from(new Uint8Array(32)),
          ])
        }
        const signatures = transaction.requiredKeys.map(
          (pub) => {
            const privateKey = Chain.getPrivateKeyByPublicKey(pub);
            const signature = Chain.get(chainId).signature(payload, privateKey, false, false);
            return signature;
          }
        );
        return {
          signatures,
          serializedTransaction: transaction.serializedTransaction
        }
      }
    }
  }

  /**
   * 查询账号
   * @param {string} account 账户名称
   * 
   */
  static findLocalAccount(account, chainId=eosChainId) {
    let wallets = store.state.wallets;
    for (let index = 0; index < wallets.length; index++) {
      let wallet = wallets[index];
      if (wallet.name === account && wallet.chainId === chainId) {
        return { wallet, index };
      }
    }
  }

   /**
   * 查询公钥对应的帐户
   * @param {string} account 账户名称
   * 
   */
  static async fetchPermissions(account, chainId) {

    let result = { code: errorCode.OK, permissions: [ 'active '] };
    
    let { wallet } = this.findLocalAccount(account, chainId);
    try {
      const accinfo = await this.get(chainId).getAccount(account);
      if (!accinfo) {
        throw new Error('fetch account eror');
      }
      for (const key of wallet.keys) {
        let permissions = new Set();
        for (const perm of accinfo.permissions) {
          // is need x.weight >= perm.required_auth.threshold
          if (perm.required_auth.keys.findIndex(x => x.key == key.publicKey) >= 0) {
            permissions.add(perm.perm_name);
          }
        }
        key.permissions = Array.from(permissions);
      }
      // updates
      store.dispatch('setWallets', store.state.wallets);
      result.permissions = accinfo.permissions;
    } catch (e) {      result.code = errorCode.HTTP_END_POINT_ERROR;
      result.msg = i18n.t('public.requestHttpEndpointTimeout');
      // if (JSON.parse(e).error.name == "tx_cpu_usage_exceeded") result.msg = i18n.t('public.resourceLimit');
      return result;
    }
    return result;
  };


};