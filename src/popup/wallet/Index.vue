<template>
  <div class="wallet-page">
    <el-scrollbar class="full" v-if="wallets.length > 0">
      <div class="wallet-container">
        <wallet-header
          :type="valueType"
          :amount="valueAmount"
          @btnClick="handleHeaderClick"
        ></wallet-header>

        <div class="wallet-list-container" v-loading="loading">
          <div class="list-header-div">
            <div class="list-header-title">
              {{ $t("wallet.totalAssets") }}
            </div>
            <img
              @click="handleRefreshClick"
              class="list-refresh-img"
              src="../../assets/images/home_refresh.png"
            />
            <img
              @click="handleAddClick"
              class="list-refresh-img ml15"
              src="../../assets/images/home_add.png"
            />
          </div>
          <div
            @click="handleCoinClick(item)"
            class="resource-item"
            v-bind:key="item.id"
            v-for="item in tokens"
          >
            <div class="resource-item-left">
              <el-image
                :src="
                  currentChain == 'eos' && item.contract === 'eosio.token'
                    ? require('../../assets/images/eos_icon.png')
                    : item.logo
                "
                style="border:none;height:36px;width:36px;"
              >
                <div slot="error">
                  <img
                    :src="require('../../assets/images/placeholder.png')"
                    style="border:none;height:36px;width:36px;"
                  />
                </div>
              </el-image>
              <div class="list-name-img">{{ item.symbol }}</div>
            </div>
            <div class="value-item-right">
              <div class="value-item-top">{{ item.amount }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <no-account v-else></no-account>
    <token-selector v-model="showAddToken" @close-click="handleTokenSelectorClose"></token-selector>
  </div>
</template>

<script>
import { getBalanceList, isSupportChain } from '../../libraries/remote';
import { eosChainId } from '../../util/network';
import chain from '../../libraries/chain.js';
import NoAccount from '../components/NoAccount.vue';
import TokenSelector from '../components/TokenSelector.vue';
import WalletHeader from './WalletHeader.vue';
import { mapState, mapGetters } from 'vuex';
import { bignum } from '../../util/utils';


export default {
  name: 'WalletIndex',
  components: {
    NoAccount,
    WalletHeader,
    TokenSelector
  },
  props: {
    msg: String
  },
  data() {
    return {
      valueType: 'usd',
      valueAmount: '0',

      tokens: [],

      showAddToken: false,

      loading: false,
      refreshing: false,

      rexEOS: '',
      rexCount: '',
      eosPrice: 0,
    };
  },
  computed: {
    ...mapGetters({ account: 'currentWallet', userTokens: 'currentUserTokens', currentNetwork: 'currentNetwork', getOneToken: 'getOneToken' }),
    ...mapState(['wallets', 'selectedIndex', 'currentChain', 'currentChainId']),
  },

  watch: {
    selectedIndex(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadTokens();
      }
    }
  },
  async created() {
    this.$ebus.$on('refreshTokens', msg => {
      this.loadTokens();
    });
  },
  async mounted() {
    this.loadTokens();
  },
  methods: {
    
    async loadTokens(showLoading=false) {
      if (this.$store.state.wallets.length == 0) {
        return;
      }
      if (this.refreshing) {
        return;
      }
      this.refreshing = true;

      let loadTime = Date.now();
      if (showLoading) {
        this.loading = true;
      }
      const network = this.currentNetwork;
      if (this.userTokens.length == 0) {
        this.userTokens.push({
          amount: 0,
          chain: network.chain,
          ...network.token,
        });
        this.$store.dispatch('setCurrentUserTokens', this.userTokens);
      }
      this.tokens = this.userTokens.concat(); // copy
      this.fillTokensLogo(this.tokens);

      await this.getUserBalance();
      await this.handleGetEosPrice();
      await this.loadRex();

      this.refreshing = false;
      
      loadTime = Date.now() - loadTime;
      if (!showLoading || loadTime >= 800) {
        this.loading = false;
      } else {
        setTimeout(() => this.loading = false, 800 - loadTime);
      }
      
    },
    fillTokensLogo(tokens) {
      for (const token of tokens) {
        if (!token.logo) {
          const t = this.getOneToken(token);
          if (t) {
            token.logo = t.logo;
          }
        }
      }
    },
    async handleGetEosPrice() {
      const eosToken = this.tokens.find(i => i.contract === 'eosio.token' && i.symbol === 'EOS');
      if (eosToken) {
        this.valueAmount = eosToken.amount;
        this.valueType = eosToken.symbol;
        if (eosToken.chain == 'eos') {
          this.eosPrice = await chain.get().getEosPrice();
          this.valueType = 'usd';
          this.valueAmount = bignum(eosToken.amount).times(this.eosPrice).toFixed(4);
        }
      }
      
    },
    async getUserBalance() {
      const tokens = this.tokens.map(x => { return { contract: x.contract, symbol: x.symbol } } );
      await getBalanceList(this.currentChain, this.account.name, tokens, (token) => {
        const selectedToken = this.tokens.find(x => x.contract === token.contract && x.symbol == token.symbol);
        if (selectedToken) {
          selectedToken.amount = token.amount;
          this.$store.dispatch('setCurrentUserTokens', this.userTokens);
        }
      });

    },

    handleHeaderClick(index, item = {}) {
      switch (index) {
        case 1: {
          const eosToken = this.tokens.find(i => i.contract === 'eosio.token' && i.symbol === 'EOS');
          this.$router.push({
            path: '/wallet/transfer',
            query: {
              symbol: eosToken.symbol,
              contract: eosToken.contract
            }
          });
          break;
        }
        case 2: {
          this.$router.push('/wallet/receive');
          break;
        }
        case 3: {
          this.$router.push('/resource');
          break;
        }
        case 4: {
          this.$router.push('/setting');
          break;
        }
        default:
          break;
      }
    },
    handleCoinClick(item = {}) {
      if (!isSupportChain(this.currentChain)) {
        // 没有详情列表
        return;
      }
      const token = item.contract + '-' + item.symbol;
      this.$router.push('/wallet/tokenTraces/' + token);
    },
    handleAddClick() {      this.showAddToken = true;
    },

    handleRefreshClick() {
      this.loadTokens(true);
    },

    handleTokenSelectorClose() {
      this.showAddToken = false;
    },

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../../assets/css/color.scss";


/deep/ .el-scrollbar {
  height: 100%;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

.wallet-page {
  width: 100%;
  height: 530px;
}

.wallet-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 100%;

  .wallet-list-container {
    border-radius: 6px;
    width: 100%;
    height: auto;
    border-top: 8px solid #fff;
    margin-top: 12px;
    padding-bottom: 80px;
    .list-header-div {
      margin: 0px 0px;
      font-size: 16px;
      color: #333333;
      display: flex;
      flex-direction: row;
      align-items: center;
      border-bottom: 1px solid #eaeaea;
      padding: 0 23px;
      height: 56px;
      .list-refresh-img {
        width: auto;
        height: 14px;
        cursor: pointer;
      }
      .ml15 {
        margin-left: 15px;
      }
    }

    .list-header-title {
      color: #222;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      flex: 2;
    }
    .resource-item {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 65px;
      position: relative;
      &::after {
        content: "";
        height: 1px;
        width: 84%;
        background: #eaeaea;
        position: absolute;
        bottom: 0;
        right: 0;
      }
      .rex-class {
        position: absolute;
        left: 61px;
        bottom: 8px;
        color: #999999;
        -webkit-transform-origin-x: 0;
        -webkit-transform: scale(0.8);
        transform: scale(0.8);
        font-size: 12px;
      }
      .list-icon-img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .list-name-img {
        font-size: 15px;
        color: #222;
        margin-left: 10px;
      }
      .resource-item-left {
        display: flex;
        flex-direction: row;
        justify-content: left;
        align-items: center;
        margin-left: 15px;
      }

      .value-item-right {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        //height: 43px;

        margin-right: 15px;
        .value-item-top {
          font-weight: 600;
          font-size: 15px;
          color: #222;
        }
        .value-item-bottom {
          height: 16px;
          font-size: 11px;
          color: #999999;
        }
      }
    }
  }
}

</style>
