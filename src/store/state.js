import { getStorage, setStorage, getBackground } from '../util/utils';
import { eosChainId, supportNetworks } from '../util/network';
import localTokens from '../assets/tokens.json';
import axios from 'axios';
import store from './index.js';

//const defaultChain = { wallets: [], selectedIndex: 0, currentHttpEnd: '' };
const state = {
  networks: [], // 默认节点信息
  wallets: [], // 里面存储 eos 账号相关信息
  selectedRpc: {},
  customRpcs: {}, // 用户自定义节点相关信息
  selectedIndex: 0,
  currentChain: 'eos',
  currentChainId: '',
  passwordHash: '',
  language: 'zh-CN', // 多语言
  isLock: getBackground().vars.isLock,
  password: getBackground().vars.password,
  whitelist: [],
  recentTransfers: [], // 最近转账记录
  allTokens: {},
  userTokens: []
};
getStorage([
  'networks',
  'wallets',
  'selectedRpc',
  'customRpcs',
  'selectedIndex',
  'passwordHash',
  'language',
  'whitelist',
  'recentTransfers',
  'allTokens',
  'userTokens'
]).then(states => {
  state.networks = states.networks ? JSON.parse(states.networks) : [];
  state.wallets = states.wallets ? JSON.parse(states.wallets) : [];
  state.customRpcs = states.customRpcs ? JSON.parse(states.customRpcs) : {};
  state.selectedRpc = states.selectedRpc ? JSON.parse(states.selectedRpc) : {};
  state.selectedIndex = states.selectedIndex
    ? parseInt(states.selectedIndex)
    : 0;
  state.passwordHash = states.passwordHash || '';
  state.language = states.language || '';
  state.whitelist = states.whitelist ? JSON.parse(states.whitelist) : [];
  state.recentTransfers = states.recentTransfers ? JSON.parse(states.recentTransfers) : [];
  state.userTokens = states.userTokens ? JSON.parse(states.userTokens) : {};

  state.currentChain = 'eos';
  state.currentChainId = eosChainId;
  if (state.wallets.length > 0 && state.selectedIndex >= 0) {
    const wallet = state.wallets[state.selectedIndex];
    if (wallet) {
      state.currentChainId = wallet.chainId;
      const network = state.networks.find(x => x.chainId == wallet.chainId);
      state.currentChain = network.chain;
    }
  }

  const tokensData = states.allTokens ? JSON.parse(states.allTokens) : null;  // state.userTokens = {};
  let tokensUpdateAt = 0;
  if (!tokensData || !tokensData.tokens) {    state.allTokens = getTokenMapFromArray(localTokens);
    tokensUpdateAt = Date.now();
    setStorage('allTokens', { tokens: state.allTokens, updateAt: Date.now() });
  } else {    state.allTokens = tokensData.tokens;
    tokensUpdateAt = tokensData.updateAt;
  }
  if (Date.now() - tokensUpdateAt > 86400000) {    // update tokens
    updateTokens();
  }

  if (state.networks.length == 0) {
    // add eos and wax/telos networks
    state.networks.push(supportNetworks[0]);
    state.networks.push(supportNetworks[1]);
    state.networks.push(supportNetworks[2]);
    setStorage('networks', state.networks);
  }
});

// chrome.storage.local.clear();
function getTokenMapFromArray(tokenArray) {
  const tokenMap = {};
  for (const token of tokenArray) {
    if (!tokenMap[token.chain]) {
      tokenMap[token.chain] = {};
    }
    const k = `${token.contract}-${token.symbol}`;
    const name = `${token.chain}/${k}.png`.toLowerCase();
    token.logo = 'https://cdn.jsdelivr.net/gh/metahubwallet/eos-tokens@master/logos/' + name;
    tokenMap[token.chain][k] = token;
  }
  return tokenMap;
}

function updateTokens() {
  const url =
    'https://cdn.jsdelivr.net/gh/metahubwallet/eos-tokens@master/tokens.json';
  axios
    .get(url)
    .then(function(response) {
      const tokenArray = typeof response.data == 'string' ? JSON.parse(response.data) : response.data;
      const tokenMap = getTokenMapFromArray(tokenArray);
      store.dispatch('setAllTokens', tokenMap);    })
    .catch(function(error) {
      // handle error  update time? 
     });
}

export default state;
