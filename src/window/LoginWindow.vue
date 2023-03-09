<template>
  <div class="window">
    <!-- <TitleBar  :height="20"></TitleBar> -->
    <div class="header">
      <div class="title">{{ $t("auth.authorizeLogin") }}</div>
      <!-- <p>{{$t('auth.loginTip', [payload.domain])}}</p> -->
      <div class="domain">{{ domain }}</div>
    </div>

    <div class="search-bar">
      <div class="search-input">
        <i class="el-icon-search"></i>
        <input
          :placeholder="$t('auth.searchAccounts')"
          prefix-icon="el-icon-search"
          v-model="word"
        />
      </div>
    </div>

    <el-scrollbar>
      <ul class="accounts">
        <li v-for="account in accounts" :key="account.name">
          <div class="account-name">
            <h3>{{ briefAccount(account.account, 12, 10) }}</h3>
            <el-dropdown class="permission" @command="changePermision">
              <span class="el-dropdown-link">
                {{ account.permission
                }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  :key="item"
                  :command="{ account, permission: item }"
                  v-for="item in account.permissions"
                  >{{ item }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <el-button
            @click="login(account)"
            class="select-botton"
            type="primary"
            >{{ $t("auth.login") }}</el-button
          >
        </li>
        <li v-if="accounts.length === 0" class="no-account">
          <img
            class="no-account-img"
            src="../assets/images/no_account.png"
          />
          <div class="no-account-tip">{{ $t("public.noImport") }}</div>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script>
// import { indexOf } from '../config/mnemonic';
import { eosChainId } from '../util/network';
import { briefAccount } from '../util/utils';
export default {
  name: 'LoginWindow',
  components: {
    // TitleBar
  },
  data() {
    return {
      word: '-',
      chainId: eosChainId,
      payload: { domain: '' },
      accounts: []
    };
  },
  computed: {
    allAccounts: function() {
      let accounts = this.$store.state.wallets.filter( x => x.chainId == this.chainId );
      accounts.map(x => {
        x.permissions = x.keys.flatMap(y => y.permissions);
        x.permission = x.permissions[0];
        return x;
      });
      return accounts;
    },
    domain: function() {
      if (this.payload.appName) {
        return `${this.payload.appName} / ${this.payload.domain}`;
      } else {
        return this.payload.domain;
      }
    }
  },
  watch: {
    word(m, o) {
      if (m !== o) {
        this.accounts = this.allAccounts.filter(account => {
          return account.account.includes(this.word);
        });
      }
    }
  },
  created() {
    this.windows = chrome.extension.getBackgroundPage().background.windows;
  },
  async mounted() {
    //document.title = this.$t('auth.authorizeLogin');
    this.payload = await this.windows.getParams();
    this.word = '';
    this.chainId = this.payload.chainId;
  },
  methods: {
    briefAccount,
    changePermision(command) {
      command.account.permission = command.permission;
      let idx = this.accounts.indexOf(command.account);
      if (idx >= 0) {
        this.$set(this.accounts, idx, command.account);
      }
    },
    login(walletAccount) {
      let publicKey = '';
      const permission = walletAccount.permission;
      for (const key of walletAccount.keys) {
        if (key.permissions.indexOf(permission) >= 0) {
          publicKey = key.publicKey;
        }
      }
      if (!publicKey) {
        alert('key error');
        return;
      }
      const account = {
        name: walletAccount.name,
        publicKey: publicKey,
        authority: permission,
        chainId: this.chainId,
      };
      if (walletAccount.account && walletAccount.account != walletAccount.name) {
        account.address = walletAccount.account;
      }      this.windows.returnMessage(account);    }
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/color.scss";
.window {
  width: 100%;
  height: 100%;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .header {
    font-size: 18px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 30px 20px 10px 20px;
    background-image: linear-gradient(
            rgba(246, 221, 255, 0.8),
            rgba(225, 225, 250, 0.05)
    );
    .title {
      flex-grow: 1;
      color: #222;
      font-size: 22px;
      line-height: 24px;
      font-weight: bold;
    }
    .domain {
      margin-top: 25px;
      line-height: 21px;
      font-size: 14px;
      color: #222;
    }
  }
  .search-bar {
    padding: 10px 20px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: right;
    .search-input {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 160px;
      background: #f3f3f3;
      border-radius: 14px;
      padding: 5px 10px;
      input {
        margin-left: 10px;
        outline: 0;
        font-size: 14px;
        line-height: 20px;
        flex-grow: 1;
        background: transparent;
        border: 0; 
        &::placeholder {
          color: #bbb;
        }
      }
    }
  }
  .el-scrollbar {
    flex-grow: 1;
    font-size: 14px;
    color: #7f7f7f;
    .accounts {
      padding: 0 20px 20px 20px;
      li {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 71px;
        margin-bottom: 10px;
        padding: 0 20px;
        box-shadow: 0px 1px 3px 0px rgba(255, 66, 216, 0.11);
        border-radius: 12px;
        background-color: rgba(252, 252, 252, 0.4);
        border: 1px solid #dbdbdb;
        .account-name {
          line-height: 1.2em;

          h3 {
            color: $primary-color;
            font-size: 15px;
            font-weight: bold;
          }
          .permission {
            margin-top: 5px;
            font-size: 13px;
            color: #888;
            cursor: pointer;
          }
        }
        .select-botton {
          font-size: 12px;
          background: linear-gradient(140deg, #DA00F2 0%, #BF01FA 100%, #BF01FA 100%);
          border-radius: 16px;
          font-weight: 200;
          padding: 8px 24px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #FFFFFF;
          border-color: transparent;
        }
      }
      .no-account {
        height: 380px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .no-account-img {
          width: 150px;
        }
        .no-account-tip {
          margin-top: 25px;
          color: #999;
        }
      }
    }
  }
}

/deep/ .el-scrollbar {
  height: 100%;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
