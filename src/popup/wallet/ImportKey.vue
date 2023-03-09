<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('public.importKey')"></top-handle>
      <div class="cover-content _effect">
        <div class="import-key-container">
          <div class="import-key-tip">{{ $t('public.importNetTip') }}:</div>
          <el-select
            v-model="chainId"
            size="small"
            @change="selectNetwork"
            style="width:100%;margin-top: 10px;padding-right: 15px;"
          >
            <img
              slot = "prefix"
              :src="getNetworkIcon(chainId)"
              class="icon-img"
            >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              <img
              :src="getNetworkIcon(item.value)"
              class="icon-img"
              >
              <span style=" color: #3A3949; font-size: 14px">&nbsp;{{ item.label }}</span>
            </el-option>
          </el-select>
          <div class="import-key-tip">{{ $t('public.importKeyTip') }}:</div>
          <el-input
            :autosize="{ minRows: 5, maxRows: 5}"
            :placeholder="$t('public.importKeyTip')"
            class="import-key-input"
            type="textarea"
            v-model="privateKey"
          ></el-input>
          <el-checkbox class="import-key-protocol" v-model="checked"></el-checkbox>
          <span class="check-tip">
            {{ $t('public.readAndAgree') }}
            <span @click="handleProtocolClick" class="protocol-tip">{{$t('public.readAndAgreeProtocols')}}</span>
          </span>
          <el-button @click="handleImportClick" class="import-key-btn">{{ $t('public.importKey') }}</el-button>
        </div>
      </div>
      <div @click="handleBGClick" class="account-selector-container" v-if="isShowChangeAccount">
        <import-choose @close-click="handleBGClick" @import-click="handleSelectedImportClick" v-bind:accountList="importAccountList"></import-choose>
      </div>
    </div>
    <!-- router -->
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue';
import _ from 'lodash';
import chain from '../../libraries/chain';
import { sha256, md5, encrypt } from '../../util/crypto';
import ImportChoose from './ImportChoose';
import { eosChainId, getNetworkLocalIcon } from '../../util/network';
import { mapState, mapGetters } from 'vuex';
import { getKeyAccounts } from '../../libraries/remote';
import bs58 from 'bs58';
import { Address } from 'ethereumjs-util';


export default {
  components: {
    TopHandle,
    ImportChoose
  },
  data() {
    return {
      checked: true,
      privateKey: '',
      state: this.$store.state,
      isShowChangeAccount: false,
      importAccountList: [],
      chainId: this.$route.query.chainId? this.$route.query.chainId : eosChainId,
      options: []
    };
  },
  computed: {
    ...mapState(['networks']),
    ...mapGetters(['findNetwork'])
  },
  created() {
    for (const network of this.networks) {
      this.options.push({
        value: network.chainId,
        label: '   ' + network.name
      });
    }  },
  methods: {
    selectNetwork() {    },
    handleBGClick() {
      this.isShowChangeAccount = false;
    },
    handleProtocolClick() {
      this.$router.push('/wallet/protocol');
    },
    async handleImportClick() {
      /** 判断协议勾选 */
      if (!this.checked) {
        this.$message({
          showClose: true,
          offset: 70,
          message: '请仔细阅读协议,并勾选',
          type: 'warning'
        });
        return;
      }

      const loading = this.$loading({
        lock: true,
        background: 'rgba(0, 0, 0, 0.6)'
      });
      /** 循环遍历需要取的协议 */
      const importAccounts = [];
      let tipMessage = this.$t('public.noAccountForPrivateKey');
      let isKey = chain.get().isValidPrivate(this.privateKey);
      let ethAddress = '';
      if (!isKey && this.privateKey.length == 64) {
        // d1044f5fc855f470870935b6769564b6d966aa9fa881a9b42f2779024b4c5f50
        // 0000000000000000000000000000000000000000000000000000000000000000        const privateKeyHex = Buffer.from(this.privateKey, 'hex');
        // const address = Address.fromPrivateKey(Buffer.from(this.privateKey));
        ethAddress = Address.fromPrivateKey(privateKeyHex).toString();
        let versionedKey = '80' + this.privateKey;
        const sha256dKey = sha256(Buffer.from(versionedKey, 'hex'));
        const checksum = sha256(Buffer.from(sha256dKey, 'hex')).substring(0, 8);
        versionedKey +=  checksum;        
        this.privateKey = bs58.encode(new Uint8Array(Buffer.from(versionedKey, 'hex')));
        isKey = true;
      }
      if (isKey) {
        let network = this.networks.find(x => x.chainId == this.chainId);
        // for (let network of this.networks) {          let chainAccount = {};
          chainAccount.chainId = network.chainId;
          chainAccount.seed = sha256('metahub' + Math.random(), new Date().toString()).substr(0, 16).toUpperCase();
          chainAccount.blockchain = 'eos'; // eth, tron ...
          chainAccount.smoothMode = false; // 默认关闭顺畅模式
          const publicKey = chain.get(network.chainId).privateToPublic(this.privateKey);
          const privateKey = encrypt(this.privateKey, md5(chainAccount.seed + this.$store.getters.password));
          const key = { publicKey, privateKey, permissions: [] };
          chainAccount.keys = [ key ];
          try {            let accounts = [];
            try {
              accounts = await getKeyAccounts(network.chain, publicKey);
            } catch (e) {
              accounts = [];
            }            if (accounts.length == 0) {
              accounts = await chain.get(network.chainId).getKeyAccounts(publicKey);
            }            if (accounts.length == 0) {
              //next chain
              tipMessage = this.$t('public.noAccountForPrivateKey');
              // continue;
            }
            for (let account of accounts) {
              const newAccount = Object.assign({}, chainAccount);
              // todo: support eth address
              newAccount.name = account;  // real eos account
              newAccount.account = ethAddress != '' ? ethAddress : account;  // account (display)

              let existed = false;
              for (let i = 0; i < this.$store.state.wallets.length; i++) {
                const element = this.$store.state.wallets[i];
                if (element.name === newAccount.name && element.chainId === newAccount.chainId) {
                  existed = true;
                  break;
                }
              }
              if (existed) {
                tipMessage = this.$t('public.accountExists');
              } else {
                importAccounts.push(newAccount);
              }
            }
          } catch (e) {          }
        // }
      } else {
        tipMessage = this.$t('public.invaildPrivateKey');
      }
      loading.close();

      importAccounts.sort(this.sortAccounts);

      if (importAccounts.length > 1) {
        this.importAccountList = importAccounts;
        this.isShowChangeAccount = true;
      } else if (importAccounts.length == 1) {
        await this.importWallets(importAccounts);
        return;
      } else {        this.$message({
          showClose: true,
          offset: 70,
          message: tipMessage,
          type: 'error'
        });
      }
    },

    async handleSelectedImportClick(selectedWallets) {
      if (selectedWallets.length < 1) {
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('wallet.selectOneAtLeast'),
          type: 'warning'
        });
        return;
      }

      const loading = this.$loading({
        lock: true,
        background: 'rgba(0, 0, 0, 0.6)'
      });

      await this.importWallets(selectedWallets);

      loading.close();
    },

    //eos first
    sortAccounts(f, s) {
      if (f.chainId == s.chainId) {
        return f.name > s.name ? 1 : -1;
      } else {
        if (f.chainId == eosChainId) {
          return -1;
        }
        if (s.chainId == eosChainId) {
          return 1;
        }
        return f.chainId > s.chainId ? 1 : -1;
      }
    },

    async importWallets(wallets) {
      for (const wallet of wallets) {
        this.$store.state.wallets.push(wallet);
        await chain.fetchPermissions(wallet.name, wallet.chainId);
      }
      this.$store.state.wallets.sort(this.sortAccounts);

      const firstWallet = wallets[0];
      let index = this.$store.state.wallets.indexOf(firstWallet);
      this.$store.state.selectedIndex = index >= 0 ? index : 0;
      this.$store.dispatch('setWallets', this.$store.state.wallets);
      this.$store.dispatch('setSelectedIndex', this.$store.state.selectedIndex);

      const ebus = this.$ebus;
      setTimeout(() => { ebus.$emit('refreshTokens', true); }, 100);

      this.$message({
        showClose: true,
        offset: 70,
        message: this.$t('wallet.importSuccess'),
        type: 'success'
      });
      this.privateKey = '';
      this.$router.go(-1);
    },
    getNetworkIcon(chainId) {
      const chain = this.findNetwork(chainId).chain;
      return getNetworkLocalIcon(chain);
    }

  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/color.scss';
/deep/ .el-input__prefix {
  top: 23px;
  left: 12px;
}

.account-selector-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column-reverse;
}

.el-select-dropdown__item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.icon-img {
  width: 24px;
}
.import-key-container {
  padding-left: 15px;


  .import-key-tip {
    font-size: 12px;
    color: #222;
    margin-top: 20px;
  }
  .import-key-input {
    margin-top: 10px;
    font-size: 14px;
    color: #999999;
    width: 345px;
  }
  .import-key-protocol {
    margin-top: 8px;
    font-size: 14px;
    color: #999999;
    margin-right: 0px;
  }
  .import-key-btn {
    background: linear-gradient(140deg, #DA00F2 0%, #BF01FA 100%, #BF01FA 100%);
    box-shadow: 0px 2px 6px 0px rgba(210,0,244,0.09);
    border-radius: 50px;
    width: 178px;
    height: 44px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #FFFFFF;
    line-height: 20px;
    text-shadow: 0px 2px 6px rgba(210, 0, 244, 0.09);
    margin-top: 58px;
    &:active{
      border-color: $primary-color;
    }
  }
  .check-tip {
    color: #999999;
    font-size: 12px;
  }
  .protocol-tip {
    color: $primary-color;
    cursor: pointer;
  }
  /deep/ .el-select{
    .el-input__inner{
      height: 71px;
      background: rgba(252, 252, 252, 0.4);
      box-shadow: 0px 1px 3px 0px rgba(255,66,216,0.11);
      border-radius: 12px;
      border: 1px solid #DBDBDB;
      color: #222;
      font-weight: bold;
    }
  }
  /deep/ .el-textarea__inner{
    background: #F8F8F8;
    border-radius: 12px;
    &:focus{
      border-color: $primary-color;
    }
  }
  /deep/ .el-checkbox__inner{
    border-color: $primary-color;
  }
  /deep/ .el-checkbox__input.is-checked{
    .el-checkbox__inner{
      background-color: $primary-color;
    }

  }
}

</style>


