<template>
  <section class="account-selector" v-show="isShow">
    <div class="selector-bg" @click="handleCloseClick"></div>
    <transition name="bottomToTop">
      <div class="selector-container" v-show="isShow">
        <div class="selector-header">
          <img @click="handleLock" class="lock-icon" src="../../assets/images/lock.png" />
          <div class="title">{{ $t('auth.chooseAccount') }}</div>
          <i @click="handleCloseClick" class="el-message-box__close el-icon-close close"></i>
        </div>
        <div class="list-container">
          <el-tabs tab-position="left" v-model="activeChainId" type="card">
            <el-tab-pane
              v-for="(item) in networks"
              :key="item.chainId"
              :name="item.chainId"
              :label="item.name"
            >
              <div slot="label">
                <el-image :src="getNetworkIcon(item)" class="icon-img"></el-image>
              </div>
              <el-scrollbar class="full">
                <div class="accounts">
                  <div class="title-cell" style="border:none;">
                    
                    <span>{{item.name}}</span>
       
                    <div class="actions">
                      <div v-if="searchName != '' || accounts.length >= 8" class="search-acts">
                        <i class="el-icon-search"> </i>
                        <input v-model="searchName" :placeholder="$t('wallet.searchTip')" />
                      </div>
                      <img
                        v-show="searchName != '' || accounts.length"
                        @click="handleImportClick(item.chainId)"
                        class="add-icon"
                        src="../../assets/images/account_add.png"
                      />
                    </div>
                  </div>
                  <div v-show="accounts.length == 0">
                    <el-button
                      @click="handleImportClick(item.chainId)"
                      class="import-key-btn"
                    >+{{ $t('public.importKey') }}</el-button>
                  </div>

                  <div
                    :key="item.index"
                    @click="handleAccountClick(item)"
                    class="account-cell"
                    v-for="(item) in accounts"
                  >
                    <div class="account-left">
                      <div class="account-left-name">
                        <span>{{showAccount(item.account)}}</span>
                        <img
                          @click="handleCopyClick()"
                          class="account-cell-key-copy"
                          src="../../assets/images/account_copy.png"
                          v-clipboard:copy="item.name"
                          v-clipboard:error="onError"
                          v-clipboard:success="onCopy"
                        />
                      </div>
                      <div class="account-left-key" >{{item.keys[0].publicKey.substr(0,8)}}...{{item.keys[0].publicKey.substr(-16,16)}}</div>
                    </div>
                    <img
                      class="close"
                      src="../../assets/images/account_select.png"
                      v-show="selectedIndex == item.index && state.currentChainId === item.chainId"
                    />
                  </div>
                </div>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
     </transition>
  </section>
</template>

<script>
import _ from 'lodash';
import {mapState, mapGetters, mapActions} from 'vuex';
import { getNetworkLocalIcon } from '../../util/network';

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
      state: this.$store.state,
      activeChainId: this.$store.state.currentChainId,
      searchName: '',
    };
  },
  computed: {
    ...mapState(["selectedIndex","networks","wallets"]),
    ...mapGetters(["findNetwork"]),
    ...mapState(["networks"]),
    accounts() {
      return this.wallets.filter(x => x.chainId == this.activeChainId && (this.searchName == '' || x.account.includes(this.searchName)));
    }
  },
  watch: {
    isShow(newVal) {    }
  },
  mounted() {
  },
  methods: {
    ...mapActions(["setIsLock", "setPassword"]),
    getNetworkIcon(item) {
      return getNetworkLocalIcon(item.chain, item.chainId == this.activeChainId);
    },
    showAccount(account) {
      if (account.length <= 12) {
        return account;
      }
      return account.substr(0, 10) + '...' + account.substr(-8, 8);
    },
    handleLock(){
      this.$emit("close-click");
      this.setPassword("");
      this.setIsLock(true);
    },
    handleBGClick(event) {
      event.stopPropagation();
    },
    handleImportClick(chainId) {
      this.handleImportClick(chainId);
      this.$emit("close-click");
    },
    handleCloseClick(event) {
      this.$emit("close-click");
    },
    handleAccountClick(account) {      //this.$store.state.selectedIndex = account.index
      let index = this.$store.state.wallets.indexOf(account);      
      this.$store.dispatch("setSelectedIndex", index);
      this.$emit("account-click", index);
    },
    handleCopyClick() {
      event.stopPropagation();
    },
    handleImportClick(chainId) {
      this.$emit("import-click", chainId);
    },
    onCopy() {
      this.$message({
        showClose: true,
        offset: 70,
        message: this.$t("setting.copySuccess"),
        type: "success"
      });
    },
    onError() {
      this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('setting.copyFailure'),
          type: 'error'
        });
    }
  }
};
</script>

<style lang="scss" scoped>
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
  height: 440px;
}

.account-selector {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 97;
}

.bg-img {
  width: 7.5px;
  height: auto;
  margin-right: 15px;
}
.lock-icon{
  height: 21px;
  width: auto;
  cursor: pointer;
  margin-left: 18px;
}
.close {
  cursor: pointer;
  width: 14px;
  height: auto;
  // margin-right: 15px;
}
.add-icon{
  width: auto;
  height: 16px;
  cursor: pointer;
}
.import {
  cursor: pointer;
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
  height: 440px;
  z-index: 100;
  border-radius: 8px 8px 0 0;
  background-color: white;
  font-size: 16px;

  .selector-header {
    font-size: 16px;
    color: #222;
    height: 40px;
    border-bottom: 1px solid $separate-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 16px;
      color: #222;
      font-weight: bold;
    }
    i {
      margin-right: 17px;
    }
  }

  .import-wallet {
    height: 65px;
    margin-left: 15px;
  }

  .list-container {
    padding: 0;
    overflow: hidden;

    .icon-img {
      width: 30px;
      height: 30px;
      border-radius: 15px;
    }

    .import-key-btn {
      margin-top: 15px;
      background: $primary-color;
      border-radius: 6px;
      width: 100%;
      height: 40px;
      font-size: 15px;
      font-weight: 400;
      color: #ffffff;
      letter-spacing: 0;
    }

    .el-tabs--left,
    .el-tabs--right {
      height: 400px;
    }

    /deep/ .el-tabs--left .el-tabs__header.is-left {
      margin-right: 0px;
      border: none;
      border-right: 1px solid $separate-color;

      .el-tabs__nav-wrap.is-left {
        margin-right: 0;
      }
    }

    /*定义了滚动条整体样式；*/
    /deep/ .el-tabs--left.el-tabs--card .el-tabs__nav::-webkit-scrollbar {
      width: 0px;
    }


    /deep/ .el-tabs--left.el-tabs--card .el-tabs__nav {
      border: none;
      height: 100%;
      background: #fff;
      overflow-y: scroll;
    }

    /deep/ .el-tabs__item {
      width: 60px;
      height: 55px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 15px;
    }

    /deep/ .el-tabs__item.is-left {
      background: #fff;
      border: none;
    }

    /deep/ .el-tabs__item.is-left.is-active {
      background: #ffffff;
      position: relative;
      &::after{
        position: absolute;
        content: '';
        width: 3px;
        height: 18px;
        background: #AE00E4;
        border-radius: 2px;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
      }
    }

    /deep/ .el-tabs__content, /deep/ .el-tab-pane {
      height: 100%;
      overflow: hidden;
    }
  }

  .accounts {
    padding: 0 15px;
    overflow: visible;
    display: flex;
    flex-direction: column;

    .title-cell {
      font-size: 16px;
      color: #222;
      height: 40px;
      border-bottom: 1px solid $separate-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 24px;
      line-height: 1em;
      .search-acts {
        margin-right: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: #ddd 1px solid;
        height: 24px;
        i {
          font-size: 12px;
          margin-right: 3px;
        }
        input {
          border: none;
          width: 70px;
          color: #666;
          font-size: 12px;
          &::placeholder {
            color: #999;
          }
        }
      }
    }

    .account-cell {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 72px;
      background: #030134;
      box-shadow: 0px 2px 4px 0px rgba(3,1,52,0.12);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;

      .account-left {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .account-left-name {
          font-size: 14px;
          color: #ffffff;
          font-weight: 600;
          .account-cell-key-copy {
            height: 10px;
            width: 11px;
            cursor: pointer;
          }
        }
        .account-left-key {
          color: #ffffff;
          display: flex;
          flex-direction: row;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
