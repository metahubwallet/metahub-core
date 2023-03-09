import { setStorage, getBackground } from "../util/utils";
import _ from "lodash";

const mutations = {
  SET_TABBARINDEX: (state, tabbarIndex) => {
    state.tabbarIndex = tabbarIndex;
  },
  SET_WALLETS: (state, wallets) => {
    state.wallets = wallets;
    setStorage("wallets", wallets);
  },
  SET_SELECTEDRPC: (state, selectedRpc) => {
    state.selectedRpc = selectedRpc;
    setStorage("selectedRpc", selectedRpc);
  },
  SET_CUSTOMRPCS: (state, customRpcs) => {
    state.customRpcs = customRpcs;
    setStorage("customRpcs", customRpcs);
  },
  SET_SELECTEDINDEX: (state, selectedIndex) => {
    const wallet = state.wallets[selectedIndex];
    state.currentChainId = wallet.chainId;
    const network = state.networks.find(x => x.chainId == wallet.chainId);
    state.currentChain = network.chain;
    state.selectedIndex = selectedIndex;
    setStorage("selectedIndex", selectedIndex);
  },
  SET_NETWORKS: (state, networks) => {
    state.networks = networks;
    setStorage("networks", networks);
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language;
    setStorage("language", language);
  },
  SET_PASSWORDHASH: (state, passwordHash) => {
    state.passwordHash = passwordHash;
    setStorage("passwordHash", passwordHash);
  },
  SET_ISLOCK: (state, isLock) => {
    getBackground().vars.isLock = isLock;
    state.isLock++;
  },
  SET_PASSWORD: (state, password) => {
    getBackground().vars.password = password;
    state.password++;
  },
  SET_MNEMONIC: (state, mnemonic) => {
    state.mnemonic = mnemonic;
    setStorage("mnemonic", mnemonic);
  },
  SET_ALLTOKENS: (state, tokens) => {
    state.allTokens = tokens;
    setStorage("allTokens", { tokens, updateAt: Date.now() });
  },
  ADD_WHITEOBJ: (state, whiteObj) => {
    state.whitelist.push(whiteObj);
    setStorage("whitelist", state.whitelist);
  },
  DEL_WHITEOBJS: (state, deleteArray) => {
    state.whitelist = state.whitelist.filter(oldItem => {
      let isNeed = true;
      deleteArray.forEach(delItem => {
        if (_.isEqual(oldItem, delItem)) {
          isNeed = false;
        }
      });
      return isNeed;
    });
    setStorage("whitelist", state.whitelist);
  },
  ADD_RECENTTRANSFERS: (state, appObj) => {
    state.recentTransfers = state.recentTransfers.filter(oldItem => {
      return oldItem.account !== appObj.account;
    });
    // max 50
    if (state.recentTransfers.length > 49) {
      state.recentTransfers.splice(49, state.recentTransfers.length - 49);
    }
    state.recentTransfers.unshift(appObj);
    setStorage("recentTransfers", state.recentTransfers);
  },
  SET_USERTOKENS: (state, userTokens) => {
    state.userTokens = userTokens;
    setStorage("userTokens", userTokens);
  },
  SET_CURRENT_USERTOKENS: (state, {userTokens, getters}) => {
    const allUserTokens = state.userTokens;
    allUserTokens[getters.currentWalletKey] = userTokens;
    state.userTokens = allUserTokens;
    setStorage("userTokens", allUserTokens);
  },
};

export default mutations;
