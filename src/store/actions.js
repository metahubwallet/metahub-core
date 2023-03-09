const actions = {
  setTabbarIndex({ commit }, tabbarIndex) {    commit('SET_TABBARINDEX', tabbarIndex);
  },
  setWallets({ commit }, wallets) {
    commit('SET_WALLETS', wallets);
  },
  setSelectedRpc({ commit }, selectedRpc) {
    commit('SET_SELECTEDRPC', selectedRpc);
  },
  setCustomRpcs({ commit }, customRpcs) {
    commit('SET_CUSTOMRPCS', customRpcs);
  },
  setSelectedIndex({ commit }, selectedIndex) {
    commit('SET_SELECTEDINDEX', selectedIndex);
  },
  setNetworks({ commit }, networks) {
    commit('SET_NETWORKS', networks);
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language);
  },
  setPasswordHash({ commit }, passwordHash) {
    commit('SET_PASSWORDHASH', passwordHash);
  },
  setIsLock({ commit }, isLock) {
    commit('SET_ISLOCK', isLock);
  },
  setPassword({ commit }, password) {
    commit('SET_PASSWORD', password);
  },
  setMnemonic({ commit }, mnemonic) {
    commit('SET_MNEMONIC', mnemonic);
  },
  setAllTokens({ commit }, tokens) {
    commit('SET_ALLTOKENS', tokens);
  },
  addWhiteObj({ commit }, whiteObj) {
    commit('ADD_WHITEOBJ', whiteObj);
  },
  delWhiteObjs({ commit }, deleteArray) {
    commit('DEL_WHITEOBJS', deleteArray);
  },
  addAppHistoryObj({ commit }, appObj) {
    commit('ADD_APPHISTORYOBJ', appObj);
  },
  addRecentTransfers({ commit }, appObj) {
    commit('ADD_RECENTTRANSFERS', appObj);
  },
  setUserTokens({commit},userTokens){
      commit('SET_USERTOKENS',userTokens)
  },
  setCurrentUserTokens({commit, getters},userTokens){
    commit('SET_CURRENT_USERTOKENS', {userTokens, getters})
  }
}

export default actions;
