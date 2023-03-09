import EosJs from 'eosjs1';
import ecc from 'eosjs-ecc';
import { Api, JsonRpc } from 'eosjs';
import { base64ToBinary } from 'eosjs/dist/eosjs-numeric';
import * as ricardianParser from 'eos-rc-parser';
import _ from 'lodash';
import errorCode from '../config/errorCode';
import { getCachedABI, setCacheABI } from '../util/utils';
import axios from 'axios';
import { respayerUrl } from '../config/env';

export default class EOS {
  constructor(chainId, endpoint, chain) {
    this.chainId = chainId;
    this.endpoint = endpoint;
    this.chain = chain;
  }

  api() {
    if (!this._api) {
      const payload = { chainId: this.chainId };
      const options = { 
        rpc: this.rpc(), 
        abiProvider: {
          getRawAbi: async (accountName) => {
            return await this.getRawAbi(accountName);
          }
        },
      };
      if (this.chain) {
        options.authorityProvider = this.chain.authorityProvider(payload);
        options.signatureProvider = this.chain.signatureProvider(payload);
      }
      this._api = new Api(options);
    }
    return this._api;
  }

  rpc() {
    if (!this._rpc) {
      this._rpc = new JsonRpc(this.endpoint);
    }
    return this._rpc;
  }

  updateHttpEndpoint(endpoint) {
    this.endpoint = endpoint;
    this.rpc().endpoint = endpoint;
  }


  /**
   * 查询私钥是否正确
   * @param {string} privateKey 私钥
   *
   * @returns {boolean}  true/false
   */
  isValidPrivate(privateKey) {
    return ecc.isValidPrivate(privateKey);
  }

  /**
   * 查询公钥是否正确
   * @param {string} publicKey 私钥
   *
   * @returns {boolean}  true/false
   */
  isValidPublic(publicKey) {
    return ecc.isValidPublic(publicKey);
  }

  /**
   * 私钥获取公钥
   * @param {string} privateKey 私钥
   *
   * @returns {Integer} code 200 返回正常  非200则有msg
   * @returns {string} data 公钥
   */
  privateToPublic(privateKey) {
    if (ecc.isValidPrivate(privateKey) == false) {
      return '';
    }
    return ecc.privateToPublic(privateKey);
  }

  /**
   * 获取新私钥公钥
   *
   * @returns {Integer} code 200 返回正常  非200则有msg
   * @returns {string} data.publicKey 公钥 data.privateKey 私钥
   */
  async getRandomPairKey() {
    const privateKey = await ecc.randomKey();
    const publicKey = ecc.privateToPublic(privateKey);
    return { privateKey, publicKey };
  }


  /**
   * 查询账户的RAM/CPU/NET等资源信息
   * @param {string} account 账号
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async getAccount(account = '') {
    if (account == '') {
      return { code: errorCode.NAME_EMPTY };
    }
    try {
      let res = await this.rpc().get_account(account);
      return res;
    } catch (e) {      return null;
    }
  }

  /**
   * 通过公钥查询账号
   * @param {string} publicKey 公钥
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async getKeyAccounts(publicKey) {
    try {
      let result = await this.rpc().get_accounts_by_authorizers([], [publicKey]);
      let accounts = [];
      for (const account of result.accounts) {
        accounts.push(account.account_name);
      }
      let filterAccounts =  [...new Set(accounts)];

      return filterAccounts;
    } catch (e) {
      return [];
    }
  };

  /**
   * 查询账户的EOS余额
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 余额  xxx EOS
   */
  async getCurrencyBalance(contract, account, symbol) {
    try {
      let res = await this.rpc().get_currency_balance(
        contract,
        account,
        symbol
      );
      return res[0];
    } catch (e) {
      return '';
    }
  }

  /**
   * 查询账户的币种信息
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 余额  xxx EOS
   */
    async getCurrencyStats(contract, symbol) {
    try {
      let res = await this.rpc().get_currency_stats(contract, symbol);
      return res[symbol];
    } catch (e) {
      return null;
    }
  }

  /**
   * EOS REX价格
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data
   */
  async getREXInfo(account = '') {    try {
      let res = await this.rpc().get_table_rows({
        json: true,
        code: 'eosio',
        scope: 'eosio',
        table: 'rexbal',
        lower_bound: account,
        limit: '1'
      });
      return res;
    } catch (e) {
      return null;
    }
  }

  async getEosPrice() {
    try {
      let res = await this.rpc().get_table_rows({
        json: true,
        code: 'swap.defi',
        scope: 'swap.defi',
        table: 'pairs',
        lower_bound: 12,
        upper_bound: 12,
        limit: '1'
      });
      return parseFloat(res.rows[0].price0_last);
    } catch (e) {
      // console.error(e);
      // throw e.json.error;
      return 0;
    }
  }

  /**
   * 获取powerup状态
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data
   */
  async getPowupState() {
    try {
      let res = await this.rpc().get_table_rows({
        code: 'eosio',
        scope: '',
        table: 'powup.state',
        json: true,
        limit: 1
      });
      return res && res.rows && res.rows.length ? res.rows[0] : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * EOS RAM价格
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data
   */
  async getRamMarket() {    try {
      let res = await this.rpc().get_table_rows({
        json: true,
        code: 'eosio',
        scope: 'eosio',
        table: 'rammarket'
      });
      return res;
    } catch (e) {
      return null;
    }
  }

  /**
   * EOS 为他人抵押列表
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data
   */
  async getDelegatebwList(from) {
    try {
      let res = await this.rpc().get_table_rows({
        json: true,
        code: 'eosio',
        scope: from,
        table: 'delband'
      });
      return res.rows;
    } catch (e) {
      return [];
    }
  }

  /**
   * 抵押CPU和NET
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async delegatebw(from, receiver, stake_net_quantity = '0.0000 EOS', stake_cpu_quantity = '0.0000 EOS', transfer = 0, auth) {

    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'delegatebw',
        authorization: [ auth ],
        data: {
          from,
          receiver,
          stake_net_quantity,
          stake_cpu_quantity,
          transfer,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });

    return result;
  }

  /**
   * 赎回CPU和NET
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async undelegatebw(from, receiver, unstake_net_quantity = '0.0000 EOS', unstake_cpu_quantity = '0.0000 EOS', auth) {
    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'undelegatebw',
        authorization: [ auth ],
        data: {
          from,
          receiver,
          unstake_net_quantity,
          unstake_cpu_quantity,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return result;
  }

// 立即取回赎回中的资源
  async refund(owner, auth) {
    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'refund',
        authorization: [ auth ],
        data: {
          owner
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return result;
  }


  /**
   * 购买RAM
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async buyRam(payer, receiver, quant, auth) {

    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'buyram',
        authorization: [ auth ],
        data: {
          payer,
          receiver,
          quant,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return result;

  }

  /**
   * 购买RAM
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
   async buyRamBytes(payer, receiver, bytes, auth) {
    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'buyrambytes',
        authorization: [ auth ],
        data: {
          payer,
          receiver,
          bytes,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return result;
  }

  /**
   * 出售RAM
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async sellRam(account, bytes, auth) {
    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'sellram',
        authorization: [ auth ],
        data: {
          account,
          bytes
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  /**
   * 赎回CPU和NET
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
    async refund(owner, auth) {
      const result = await this.transact({
        actions: [{
          account: 'eosio',
          name: 'refund',
          authorization: [ auth ],
          data: {
            owner,
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return result;
    }

   /**
   * powerup CPU
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
    async powerup(parms, auth) {
      const result = await this.transact({
        actions: [{
          account: 'eosio',
          name: 'powerup',
          data: parms,
          authorization: [ auth ],
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      return result;
    }

  /**
   * 转账交易
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async transfer(contract, from, to, quantity, memo, auth) {
    const result = await this.transact({
      actions: [{
        account: contract,
        name: 'transfer',
        authorization: [ auth ],
        data: {
          from,
          to,
          quantity,
          memo,
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    return result;
  }

  /**
   * 测试节点
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async testHttpEndpoint(endpoint = '') {    // return;
    let rpc = new JsonRpc(endpoint);
    return await rpc.get_info();
  }

  /**
   * 查询EOS节点排名列表
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data
   */
  async getProducers() {
    try {
      let res = await this.rpc().get_table_rows({
        json: true,
        scope: 'eosio',
        code: 'eosio',
        table: 'producers',
        key_type: 'float64',
        index_position: 'sec',
        limit: 100
      });
      return res.rows;
    } catch (e) {
      return [];
    }
  }

  /**
   * 节点投票
   * @param {Array} producers 最多30个节点 ['eoslaomaocom', 'starteosiobp'...] 节点账号名
   *
   * @returns {Integer} code 200 返回正常
   * @returns {string} data 信息
   */
  async voteProducer(voter, producers, proxy = '', auth) {    if (producers.length > 30) {
      throw { name: errorCode.VOTE_MAX_ERROR };
    }
    const result = await this.transact({
      actions: [{
        account: 'eosio',
        name: 'voteproducer',
        authorization: [ auth ],
        data: {
          voter,
          proxy,
          producers,
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    // result.data = res;
    return result;
  }

  async transact(transaction, options) {    let currentAccount = this.chain.currentAccount();
    let isProxy = currentAccount.smoothMode;
    // 是否为充值CPU
    if (transaction.actions[0].name == 'transfer' && transaction.actions[0].account=='eosio.token') {
      if (transaction.actions[0].data.to == '1stbillpayer') {
        isProxy = true;
      }
    }
    if (options.ignoreCPUProxy) {
      isProxy = false;
    } 
    if (!isProxy) {
      return this.api().transact(transaction, options);
    }
    for (const action of transaction.actions) {
      action.authorization.unshift({ 
        actor: '1stbillpayer',
        permission: 'active'
      });
    }
    // 顺畅模式下执行免CPU操作    options.broadcast = false;
    options.sign = true;
    let signedTrx = await this.api().transact(transaction, options);    // return this.rpc().push_transaction(signObj);

    const trx = this.api().deserializeTransaction(signedTrx.serializedTransaction);    // console.log('2',await this.api().deserializeActions(trx.actions));
    trx.signatures = [ signedTrx.signatures[0] ];

    let data = { signed: JSON.stringify(trx) };
    let url = respayerUrl + '/cpu/pushtx';
    let res = await axios.post(url, data);
    if (res && res.data && res.data.code == 200) {
      const serverSignature = res.data.result.signature;
      const signatures = [ serverSignature, signedTrx.signatures[0] ];
      return this.rpc().push_transaction({
        signatures,
        serializedTransaction: signedTrx.serializedTransaction,
        serializedContextFreeData: signedTrx.serializedContextFreeData
      });
    } else {
      let msg = 'unkonwn error';
      if (res && res.data && res.data.message) {
        msg = res.data.message;
      }      throw new Error(msg);
    }
  }

  signature(payload, privateKey, arbitrary = false, isHash = false) {
    if (!privateKey) {
      return null;
    }
    let sig;
    if (arbitrary && isHash) {
      sig = ecc.Signature.signHash(payload.data, privateKey).toString();
    } else {
      sig = ecc.sign(
        Buffer.from(arbitrary ? payload.data : payload.buf, 'utf8'),
        privateKey
      );
    }
    return sig;
  }

  async getRawAbi(accountName) {
    const abi = await this.getAbiJson(accountName);
    const rawAbi = this.api().jsonToRawAbi(abi);
    return { accountName, abi: rawAbi };
  }

  async getAbiJson(contract, version=2) {
    if (contract == 'eosio') {      if (version == 1) {
        return require('../assets/abi/eosio1.abi.json');
      } else {
        return require('../assets/abi/eosio.abi.json');
      }
    } else if (contract == 'eosio.token') {      if (version == 1) {
        return require('../assets/abi/eosio.token1.abi.json');
      } else {
        return require('../assets/abi/eosio.token.abi.json');
      }
    }
    const cachedABI = await getCachedABI(this.chainId, contract);
    const nowTime = new Date().getTime();
   
    if (cachedABI && cachedABI.expire && cachedABI.expire > nowTime) {
      const codeUpdateTime = new Date((await this.getAccount(contract)).last_code_update + 'Z').getTime();
      if (cachedABI.timestamp > codeUpdateTime) {        return cachedABI.abi;
      }
    }    const rawAbi = await this.rpc().get_raw_abi(contract);
    const abi = this.api().rawAbiToJson(base64ToBinary(rawAbi.abi));
    
    const savableAbi = { 
      chainId: this.chainId,
      contract, abi,
      hash: rawAbi.abi_hash,
      timestamp: nowTime,
      expire: nowTime + (86400000 * 7)
    };
    await setCacheABI(savableAbi);
    return abi;
  }

  async getAbis(contracts) {
    const abis = {};
    const options = {
      chainId: this.chainId,
      httpEndpoint: this.endpoint
    };
    const eos = new EosJs(options);
    await Promise.all(
      contracts.map(async contract => {
        const abi = await this.getAbiJson(contract, 1);
        abis[contract] = eos.fc.abiCache.abi(contract, abi);
      })
    );
    return abis;
  }


  async parseEosjsRequest(payload) {
    const { transaction } = payload;

    const contracts = _.uniq(
      transaction.actions.map(action => action.account),
      'action'
    );
    const abis = await this.getAbis(contracts);

    return await Promise.all(
      transaction.actions.map(async (action, index) => {
        const contractAccountName = action.account;

        let abi = abis[contractAccountName];
        const typeName = abi.abi.actions.find(x => x.name === action.name).type;
        const data = abi.fromBuffer(typeName, action.data);
        const actionAbi = abi.abi.actions.find(fcAction => fcAction.name === action.name);
        let ricardian = actionAbi ? actionAbi.ricardian_contract : null;

        if (ricardian) {
          const htmlFormatting = {
            h1: 'div class="ricardian-action"',
            h2: 'div class="ricardian-description"'
          };
          const signer = action.authorization.length === 1 ? action.authorization[0].actor : null;
          ricardian = ricardianParser.parse( action.name, data, ricardian, signer, htmlFormatting);
        }

        if (transaction.hasOwnProperty('delay_sec') && parseInt(transaction.delay_sec) > 0) {
          data.delay_sec = transaction.delay_sec;
        }

        return {
          data,
          code: action.account,
          type: action.name,
          authorization: action.authorization,
          ricardian
        };
      })
    );
  }


  async parseEosjs2Request(payload, endpoint) {
    const { transaction } = payload;

    const buffer = Buffer.from(Uint8Array.from(transaction.serializedTransaction), 'hex');
    const parsed = await this.api().deserializeTransactionWithActions(buffer);
    parsed.actions.map(x => {
      x.code = x.account;
      x.type = x.name;
      delete x.account;
      delete x.name;
    });

    payload.buf = Buffer.concat([
      new Buffer(transaction.chainId, 'hex'), // Chain ID
      buffer, // Transaction
      new Buffer(new Uint8Array(32)) // Context free actions
    ]);
    return parsed.actions;
  }

  async requestParser(payload, endpoint) {
    if (payload.transaction.hasOwnProperty('serializedTransaction'))
      return this.parseEosjs2Request(payload, endpoint);
    else return this.parseEosjsRequest(payload);
  }
  
}
