import _ from 'lodash';
import axios from 'axios'
import store from '../store/index.js';
import chain from './chain';


let manifestData = chrome.runtime.getManifest();
let clientVersion = manifestData.version;


//https://wax.greymass.com/v1
const lightApis = {
  eos: 'https://eos.light-api.net',
  wax: 'https://wax.light-api.net',
  telos: 'https://telos.light-api.net',
  proton: 'https://proton.light-api.net',
  kylin: 'https://testnet-lightapi.eosams.xeos.me',
  'telos-test': 'https://testnet-lightapi.eosams.xeos.me',
  'wax-test': 'https://testnet-lightapi.eosams.xeos.me',
  'proton-test': 'https://testnet-lightapi.eosams.xeos.me',
}

// const historyApis = {
//   eos: 'https://eos.greymass.com',
//   wax: 'https://wax.greymass.com',
//   telos: 'https://telos.greymass.com',
//   proton: 'https://proton.greymass.com',
//   jungle3: 'https://jungle3.greymass.com',
//   'wax-test': 'https://waxtestnet.greymass.com',
// }
const hyperionApis = {
  eos: 'https://eos.hyperion.eosrio.io',  //https://api.eossweden.org/v2
  bos: 'https://api.bossweden.org',
  wax: 'https://wax.eosrio.io',
  telos: 'https://telos.eosrio.io',  // https://mainnet.telos.net/v2	
  proton: 'https://proton.cryptolions.io',
  kylin: 'https://kylin.eossweden.org',
  jungle: 'https://jungle.eossweden.org',
  jungle3: 'https://jungle3.eosrio.io',
  'bos-test': 'https://tst.bossweden.org',
  'telos-test': 'https://testnet.telos.net',
  'wax-test': 'https://testnet.wax.pink.gg',
  'proton-test': 'https://testnet.protonchain.com',
}

export const isSupportChain = (chain) => {
  return hyperionApis[chain] ? true : false;
}

export const getEndpoints = async (chainId = store.state.currentChainId) => {
  try {
    const chain = store.getters.findNetwork(chainId).chain;
    let res = await axios.get(`https://cdn.jsdelivr.net/gh/metahubwallet/chain-rpcs@master/${chain}-rpcs.json`);
    return res ? res.data : [];
  } catch (e) {
    // console.error(e);
    return [];
  }
};

export async function getKeyAccounts(chain, publicKey) {
  try {
    if (!lightApis[chain]) {
      return [];
    }
    let res = await axios.get(lightApis[chain] + '/api/key/' + publicKey);
    if (res.status == 200 && res.data) {
      const ckey = chain.replace('-', '');
      if (res.data[ckey]) {
        const accounts = res.data[ckey].accounts;
        return Object.keys(accounts);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function getBalanceList(chain_, account, tokens, onBlanceInquired) {
  try {
    // hyperion Api 查询数据太旧
    // if (hyperionApis[chain_]) {
    //   let res = await fetch(
    //     hyperionApis[chain_] + '/state/get_tokens',
    //     { account, limit: 200 }
    //   );
    //   const tokens = res.tokens ? res.tokens : [];
    //   // // 有时候这个接口不会返回 eos 余额，需要额外查询
    //   // const systemToken = store.getters.findNetworkByChain(chain_).token;
    //   // const systemTokenBalance = tokens.find(x => x.contract == systemToken.contract && x.symbol == systemToken.symbol);
    //   // if (!systemTokenBalance) {
    //   //   const balance = await chain.get().getCurrencyBalance(systemToken.contract, account, systemToken.symbol);
    //   //   systemToken.amount = balance ? balance.split([' '])[0] : 0;
    //   //   tokens.push(systemToken);
    //   // }
    //   // todo: 查询数据可能会太旧，允许在设置中心切换light接口查询
    //   return tokens;
    // }
    // to use: http://light-api/api/account/CHAIN/ACCOUNT
    const balances = [];
    for (const t of tokens) {
      const balance = await chain.get().getCurrencyBalance(t.contract, account, t.symbol);
      t.amount = balance ? balance.split([' '])[0] : 0;
      balances.push(t);
      if (typeof onBlanceInquired == 'function') {
        onBlanceInquired(t);
      }
    }
    return balances;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTransactionList(chain, data) {
  try {
    if (!hyperionApis[chain]) {
      return [];
    }
    let url = hyperionApis[chain] + '/v2/history/get_actions?' + (new URLSearchParams(data)).toString();
    let res = await axios.get(url);
    const actions = res.data && res.data.actions ? res.data.actions : [];
    actions.map(i => {
      i.receiver = i.act.data.to;
      i.sender = i.act.data.from;
      i.quantity = i.act.data.quantity;
      i.memo = i.act.data.memo
      return i;
    });
    return actions;
  } catch (e) {
    console.error(e);
    return [];
  }
}

