<template>
  <div class="main-container">
    <div class="nav-header-view">
      <div class="nav-view-item">
        <!-- <img class="nav-top-left-icon" src="../assets/images/logo@2x.png"> -->
        <!-- <span class="nav-left-text">Metahub</span> -->
        <div class="btn-import" @click="showImportWalletDialog">{{ $t('public.importBackup') }}</div>
      </div>
      <div class="nav-view-item">
        <img class="nav-top-right-language-icon" src="../assets/images/change_language@2x.png" />
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="el-dropdown-link">
            {{ $t('public.language') }}
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
            <el-dropdown-item command="en">English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="container" v-if="currentPage == 1">
      <div class="title">
        <p>{{ $t('public.welcomeTo') }}</p>
        <img alt class="logo-img" src="../assets/images/metahub@2x.png" />
      </div>

      <div class="tip">{{ $t('public.settingPasswordTip') }}</div>
      <el-form :inline="true" :model="formData" @keyup.enter.native="submit()">
        <el-input class="password-input" :placeholder="$t('public.password')" type="password" v-model="formData.password1"> </el-input>
        <el-input class="password-input" :placeholder="$t('public.repeatPassword')" type="password" v-model="formData.password2"> </el-input>
        <el-button @click="submit()" class="submit-bottom">{{ $t('public.start') }}</el-button>
      </el-form>
    </div>
    <div class="container" v-if="currentPage == 2">
      <div class="tip2">{{ $t('public.setMnemonic') }}</div>
      <div class="tip3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('public.setMnemonicTip') }}</div>
      <el-input v-model="mnemonics[0]"></el-input>
      <el-input v-model="mnemonics[1]"></el-input>
      <el-input v-model="mnemonics[2]"></el-input>
      <el-button @click="submit2()" class="next-bottom">{{ $t('public.start') }}</el-button>
    </div>

    <el-dialog :title="$t('public.importBackup')" :visible.sync="showImportWallet" :modal-append-to-body="false" width="80%">
      <div class="dialog-title">
        {{ $t('setting.encryptPassword') }}
      </div>
      <el-input v-model="encryptPassword" show-password :placeholder="$t('setting.encryptPassword')" clearable> </el-input>
      <div class="dialog-title">
        {{ $t('setting.newPassword1') }}
      </div>
      <el-input show-password v-model="password1" :placeholder="$t('setting.newPassword1')"> </el-input>
      <div class="dialog-title">
        {{ $t('setting.newPassword2') }}
      </div>
      <el-input show-password v-model="password2" :placeholder="$t('setting.newPassword2')"> </el-input>
      <div class="dialog-title">
        <el-upload :before-upload="beforeUpload" :show-file-list="false" v-if="uploadName == ''" action>
          <el-button class="upload-button" type="text">{{ $t('public.selectFileToImport') }}</el-button>
        </el-upload>
        <div class="upload-file-name" v-else>
          <i class="el-icon-document"></i>
          <span> {{ uploadName }} </span>
          <i class="el-icon-close upload-file-delete" @click="removeUpload"></i>
        </div>
      </div>
      <div class="dialog-foot">
        <el-button @click="showImportWallet = false">{{ $t('public.cancel') }}</el-button>
        <el-button type="primary" @click="handleImportWallets()">{{ $t('public.import') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { metahubKey, encrypt, decrypt, password1, password2, md5 } from '../util/crypto';
export default {
  name: 'PasswordSetting',
  props: {
    msg: String
  },
  data() {
    return {
      formData: {},
      currentPage: 1,
      mnemonics: [],
      password1: '',
      password2: '',
      encryptPassword: '',
      showImportWallet: false,
      uploadName: ''
    };
  },
  watch: {
    showImportWallet(nv, ov) {
      if (ov === true && nv === false) {
        this.password1 = '';
        this.password2 = '';
        this.encryptPassword = '';
        this.uploadName = '';
        this.file = null;
      }
    }
  },
  created() {
    console.log('languages:' + chrome.i18n.getUILanguage());
    if (chrome.i18n.getUILanguage() != 'zh-CN') {
      if (this.$store.state.language && this.$store.state.language != 'zh-CN') this.$i18n.locale = 'en';
      this.$store.dispatch('setLanguage', 'en');
    }
  },
  methods: {
    handleCommand(command) {
      this.$i18n.locale = command;
      this.$store.dispatch('setLanguage', command);
    },

    submit() {
      if (!this.formData.password1 || !this.formData.password2) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.empty'),
          type: 'warning'
        });
      }
      if (this.formData.password1 != this.formData.password2) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.passwordNoSame'),
          type: 'warning'
        });
      }
      this.submit2(); //暂时不要预留信息
      // 设置提示句
      // this.currentPage = 2;
      // this.mnemonics = this.$i18n.locale == 'zh-CN'?
      // [
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][0],
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][0],
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][0]
      // ] :
      // [
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][1],
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][1],
      //   mnemonic[Math.floor(Math.random() * mnemonic.length)][1]
      // ];
    },

    submit2() {
      // let userMnemonic = this.mnemonics.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});      // // 预留信息存储
      // this.$store.dispatch("setMnemonic", userMnemonic);
      // 跳转到首页
      let password = password1(this.formData.password1);
      let passwordHash = password2(this.formData.password1);
      // 密码存储
      this.$store.dispatch('setPasswordHash', passwordHash);
      this.$store.dispatch('setPassword', password);
      this.$store.dispatch('setIsLock', false);
      this.$router.push('/');
    },

    showImportWalletDialog() {
      this.showImportWallet = true;
    },

    //todo: to be update
    beforeUpload(file) {
      this.uploadName = file.name;
      this.file = file;
    },

    removeUpload() {
      this.uploadName = '';
      this.file = null;
    },

    handleImportWallets() {
      // check
      if (this.encryptPassword == '') {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.empty'),
          type: 'warning'
        });
      }
      if (!this.password1 || !this.password2) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.empty'),
          type: 'warning'
        });
      }
      if (this.password1 != this.password2) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.passwordNoSame'),
          type: 'warning'
        });
      }

      if (this.uploadName == '' || !this.file) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.importErrorTip'),
          type: 'warning'
        });
      }

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.importWalletsFromData(e.target.result);
      };
      fileReader.readAsText(this.file);
      return false;
    },

    importWalletsFromData(content) {
      if (!/^[0-9A-F]+$/.test(content)) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.importErrorTip'),
          type: 'warning'
        });
      }
      let importData = {};
      try {
        // 兼容旧版
        const key = md5(metahubKey + md5(this.encryptPassword));
        const decryptData = decrypt(content, key);
        importData = JSON.parse(decryptData);
      } catch (err) {
        try {
          // 兼容旧版          const decryptData = decrypt(content, metahubKey);
          importData = JSON.parse(decryptData);
          for (const wallet of importData.wallets) {
            for (const key of wallet.keys) {
              key.privateKey = decrypt(key.privateKey, md5(wallet.seed + password1(this.encryptPassword)));
            }
          }
        } catch (err) {          return this.$message({
            showClose: true,
            offset: 70,
            message: this.$t('public.encryptPasswordError'),
            type: 'warning'
          });
        }
      }

      // 检查格式是否正确
      if (!importData.wallets) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.importErrorTip2'),
          type: 'warning'
        });
      }

      importData.isLock = true;
      importData.password = password1(this.password1);
      importData.passwordHash = password2(this.password1);

      // 重新加密
      for (const wallet of importData.wallets) {
        for (const key of wallet.keys) {
          key.privateKey = encrypt(key.privateKey, md5(wallet.seed + importData.password));
        }
      }

      this.$store.dispatch('setWallets', importData.wallets);
      this.$store.dispatch('setUserTokens', importData.userTokens);
      this.$store.dispatch('setSelectedIndex', importData.selectedIndex);
      this.$store.dispatch('setPassword', importData.password)
      this.$store.dispatch('setPasswordHash', importData.passwordHash);
      this.$store.dispatch('setNetworks', importData.networks);
      this.$store.dispatch('setSelectedRpc', importData.selectedRpc);
      this.$store.dispatch('setCustomRpcs', importData.customRpcs);
      this.$store.dispatch('setIsLock', true);
      this.$store.dispatch("setLanguage", importData.language);
      // this.$store.dispatch("setMnemonic", importData.mnemonic);

      this.$ebus.$emit('refreshTokens', true);

      this.$router.push('/wallets');

      return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.importBackupSuccess'),
          type: 'success'
        });
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '../assets/css/color.scss';

.btn-import {
  margin: 10px;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: rgb(226, 109, 210);
  border-radius: 5px;
  cursor: pointer;
}

.main-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  height: 100%;
  width: 100%;
  background-image: url('../assets/images/bg-2.png');
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 210px 250px;

  .title {
    display: flex;
    flex-direction: column;
    font-size: 37px;
    font-weight: bold;
    align-items: center;
    margin: 35px 0 55px 0;
    .logo-img {
      padding-top: 10px;
      width: 180px;
    }
  }
  .nav-header-view {
    background-color: rgba(255, 255, 255, 0);
    // font-family: PingFangSC-Regular;
    font-size: 18px;
    letter-spacing: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    // height: 50px;
    width: 100%;
    .nav-top-left-icon {
      margin-left: 10px;
      width: 19px;
      height: 24px;
    }
    .nav-view-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .nav-top-right-language-icon {
      margin-right: 10px;
      width: 16px;
      height: 16px;
    }
    .el-dropdown {
      margin-right: 15px;
      font-weight: 400;
    }
  }

  .tip {
    padding-bottom: 30px;
    font-family: PingFangSC-Regular;
    font-size: 13px;
    color: #333333;
    letter-spacing: 0;
    line-height: 24px;
    text-align: center;
  }

  .container {
    /deep/ .el-form {
      text-align: center;
      width: 273px;
      .el-input__prefix {
        padding: 6px;
      }
      .el-input__inner {
        padding-left: 36px;
        font-weight: 400;
        background: #f8f8f8;
        border-radius: 25px;
        height: 55px;
        border-color: #eee;
        color: #333;
        &:focus {
          border-color: $primary-color;
        }
      }
      .el-input {
        padding-bottom: 20px;
        width: 273px;
        .prefix-img {
          width: 18px;
          height: 22px;
        }
      }

      .submit-bottom {
        width: 273px;
        height: 50px;
        background: linear-gradient(140deg, #da00f2 0%, #bf01fa 100%, #bf01fa 100%);
        box-shadow: 0px 2px 6px 0px rgba(210, 0, 244, 0.09);
        border-radius: 50px;
        width: 273px;
        font-weight: 400;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-top: 50px;
        &:active {
          border-color: $primary-color;
        }
      }
    }
  }
  .tip2 {
    padding-bottom: 10px;
    padding-top: 20px;
    font-family: PingFangSC-Regular;
    font-size: 18px;
    color: #333333;
    letter-spacing: 0;
    line-height: 24px;
  }
  .tip3 {
    padding: 10px 30px;
    font-family: PingFangSC-Regular;
    // font-size: 18px;
    color: #333333;
  }

  .next-bottom {
    background: $primary-color;
    font-size: 15px;
    color: #ffffff;
    width: 273px;
    font-weight: 400;
    border-color: $primary-color;
  }
}

/deep/ .el-dialog {
  border-radius: 6px;

  .dialog-foot {
    padding: 20px 0px 5px 0px;
    text-align: right;
  }
  .el-dialog__body {
    padding: 15px 20px;
  }
  .dialog-title {
    overflow: hidden;
    margin-top: 10px;
    padding-bottom: 3px;
    &:first-child {
      margin: 0;
    }
  }
  .upload-file-name {
    color: #333;
    font-size: 14px;
    padding: 6px 0;
    span {
      color: rgb(62, 100, 196);
    }
  }

  .upload-file-delete {
    cursor: pointer;
  }
}
</style>
