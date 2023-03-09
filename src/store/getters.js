const background = chrome.extension.getBackgroundPage().background;

const ignoreValue2 = (p1, p2) => {  return p1;
}

const getters = {
  isLock: state => {
    return ignoreValue2(background.vars.isLock, state.isLock);
  },
  password: state => {    return ignoreValue2(background.vars.password, state.password);
  },
  currentWallet: state => {
    return state.wallets.length > 0 ? state.wallets[state.selectedIndex] : null;
  },
  currentWalletKey: (state, getters) => {
    const account = getters.currentWallet;
    return account.name + '@' + account.chainId.substr(0, 16);
  },
  currentSymbol: state => {
    const network = state.networks.find(x => x.chainId == state.currentChainId);
    return network ? network.token.symbol : 'EOS';
  },
  currentUserTokens: (state, getters) => {
    const key = getters.currentWalletKey;
    return state.userTokens[key] ? state.userTokens[key] : [];
  },
  findNetwork: state => chainId => {
    return state.networks.find(x => x.chainId == chainId);
  },
  findNetworkByChain: state => chain => {
    return state.networks.find(x => x.chain == chain);
  },
  currentNetwork: (state, getters) => {
    return getters.findNetwork(state.currentChainId);
  },
  selectedRpc: state => (chainId) => {
    let selectedRpc = state.selectedRpc[chainId];
    if (!selectedRpc) {
      const network = state.networks.find(x => x.chainId == chainId);
      return network ? network.endpoint : '';
    }
    return selectedRpc;
  },
  getOneToken: state => token => {
    const chainToken = state.allTokens[token.chain] || {};
    const k = `${token.contract}-${token.symbol}`;
    return chainToken[k] || {};
  }
};

export default getters; 
