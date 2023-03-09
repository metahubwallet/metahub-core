<template>
  <section class="token-selector" v-show="isShow">
    <div class="selector-bg" @click="handleCloseClick"></div>
    <transition name="bottomToTop">
      <div class="selector-container" v-show="isShow">
        <div class="selector-header">
          <div class="title">{{ $t("wallet.addNewTokens") }}</div>
          <i
              @click="handleCloseClick"
              class="el-message-box__close el-icon-close close"
          ></i>
        </div>
        <div class="selector-searchWords">
          <el-input
              :placeholder="$t('wallet.searchKeyWord')"
              class="searchWords-input"
              v-model="searchWords"
          />
         </div>
        <div class="selector-list">
          <el-scrollbar>
            <el-table
                :data="filterTokens"
                :show-header="false"
            >
              <el-table-column property="name" width="80">
                <template slot-scope="scope">
                  <el-image
                      :src="scope.row.logo"
                      class="icon-img"
                      lazy
                  >
                    <div slot="error">
                      <img
                          v-lazy="require('../../assets/images/eos_icon.png')"
                          class="icon-img"
                      />
                    </div>
                  </el-image>
                </template>
              </el-table-column>
              <el-table-column property="name">
                <template slot-scope="scope">
                  <div class="coin-symbol">{{ scope.row.symbol }}</div>
                  <div class="coin-contract">
                    {{ $t("wallet.contract") }}: {{ scope.row.contract }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="50px;">
                <template slot-scope="scope">
                  <img
                      :src="
                    scope.row.show
                      ? require('../../assets/images/coin_add_selected.png')
                      : require('../../assets/images/coin_add.png')
                  "
                      @mouseup="coinLikeCliked(scope)"
                      style="border:none;height:25px;width:25px;"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </div>
        <div class="add-token">
            <span @click="handleAddCustomClick">{{
                $t("wallet.addMoreTokens")
              }}</span>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
  model: {
    prop: 'isShow',
    event: 'change'
  },
  props: {
    isShow: Boolean
  },
  data() {
    return {
      chainTokens: [],
      searchWords: '',
      filterTokens: [],
    };
  },
  computed: {
    ...mapGetters({userTokens: 'currentUserTokens'}),
    ...mapState(['currentChain', 'allTokens']),
  },
  watch: {
    isShow(newValue, oldValue) {      if (newValue && this.chainTokens.length == 0) {
        this.initTokens();
      }      if (newValue === false) {
        this.searchWords = '';
        this.chainTokens = [];
        this.filterTokens = [];
      }
    },
    searchWords(kw) {
      this.searchTokens(kw);
    }
  },
  methods: {
    initTokens() {
      const tokens = [];
      const chainTokens = this.allTokens[this.currentChain] || [];      for (const k in chainTokens) {
        const ct = chainTokens[k];
        if (ct.contract == 'eosio.token') {
          continue;
        }
        const token = {};
        Object.assign(token, ct);
        token.show = this.userTokens.findIndex(x => x.contract == token.contract && x.symbol == token.symbol) >= 0;
        tokens.push(token);
      }
      for (const ut of this.userTokens) {
        if (ut.contract == 'eosio.token') {
          continue;
        }
        if (tokens.findIndex(x => x.contract == ut.contract && x.symbol == ut.symbol) >= 0) {
          continue;
        }
        const token = {};
        Object.assign(token, ut);
        token.show = true;
        tokens.push(token);
      }
      this.chainTokens = tokens.sort((x, y) => x.symbol > y.symbol ? 1 : -1);
      this.searchTokens('');
    },
    searchTokens(kw) {
      kw = kw.toLowerCase();
      const tokens = kw == '' ? this.chainTokens.concat() : this.chainTokens.filter(
        data => data.symbol.toLowerCase().includes(kw) || data.contract.toLowerCase() == kw
      );
      // sort
      this.filterTokens = tokens.sort((x, y) => {
        if (x.symbol.toLowerCase() == kw) {
          return -1;
        }
        if (y.symbol.toLowerCase() == kw) {
          return 1;
        }
        if (x.show != y.show) {
          return x.show ? -1 : 1;
        }
        x.symbol > y.symbol ? 1 : -1;
      });
    },
    handleCloseClick(event) {
      this.$emit("close-click");
    },
    handleAddCustomClick() {
      this.$emit("close-click");
      this.$router.push('/wallet/AddToken');
    },
    async coinLikeCliked(scope) {      if (scope.row.show) {
        const index = this.userTokens.findIndex(x => x.contract == scope.row.contract && x.symbol == scope.row.symbol);
        this.userTokens.splice(index, 1);
        scope.row.show = false;
      } else {
          const token = {
            amount: 0,
            chain: scope.row.chain,
            contract: scope.row.contract,
            symbol: scope.row.symbol,
            precision: scope.row.precision,
          };
          this.userTokens.push(token);
          scope.row.show = true;
      }
      this.$store.dispatch('setCurrentUserTokens', this.userTokens);
      this.$ebus.$emit('refreshTokens', true);
    },

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../../assets/css/color.scss";



.bottomToTop-leave-active,
.bottomToTop-enter-active {
  transition: all 0.3s ease;
}

.bottomToTop-leave-active,
.bottomToTop-enter {
  height: 0px !important;
}

.bottomToTop-leave,
.bottomToTop-enter-active {
  height: 500px;
}

.token-selector {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 97;
}

.selector-bg{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.75);
}

.selector-container {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 500px;
  z-index: 100;
  border-radius: 8px 8px 0 0;
  background-color: white;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .selector-header {
    position:relative;
    font-size: 16px;
    color: #222;
    height: 40px;
    border-bottom: 1px solid $separate-color;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    .title {
      font-size: 16px;
      color: #222;
      font-weight: bold;
    }
    i {
      right: 17px;
      position: absolute;
    }
  }

  .selector-searchWords {
    height: 50px;
    display: flex;
    justify-content: center;
    padding-top: 10px;
    .searchWords-input {
      width: 70%;
      height: 34px;
      font-size: 14px;
      margin: 0;
      input {
        height: 100%;
      }
    }
  }

  .selector-list {
    height: 365px;
    overflow: hidden;

    .icon-img {
      height: 40px;
      width: 40px;
      margin-left: 20px;
      border-radius: 20px;
      border: 1px solid #ebebeb;
      img {
        margin-left: 0;
      }
    }
    .coin-symbol {
      font-size: 14px;
      font-weight: 700;
      color: #333333;
    }
    .coin-contract {
      font-size: 14px;
      color: #999999;
    }
  }

  .add-token {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    text-decoration: underline;
    color: #666;
    cursor: pointer;
  }

}

.el-table {
  width: 100%;
}

/deep/ .el-table .el-table__cell {
  padding: 6px 0;
}

/deep/ .el-input__inner {
  height: 34px;
}

/deep/ .el-scrollbar {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}





</style>
