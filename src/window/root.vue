<template>
  <div class="app-window app-unlock" v-if="isLock">
    <header>
      <img class="logo" src="../assets/images/logo@2x.png" />
      <div class="tip">{{ $t('password.inputPasswrod') }}</div>
      <div class="tip tip2">{{ $t('password.unlockTip') }}</div>
    </header>
    <el-form :inline="true" :model="formData" @submit.native.prevent>
      <el-input :placeholder="$t('password.toUnlock')" type="password" v-model="formData.password">
        <img class="prefix-img" slot="prefix" src="../assets/images/Initial_unlock@2x.png">
      </el-input>

      <el-button @click="submit()" class="submit-bottom" native-type="submit">{{ $t('password.unlock') }}</el-button>
    </el-form>
  </div>
  <div class="app-window" v-else>
    <router-view></router-view>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { password1, password2} from '../util/crypto.js';

require('../assets/css/common.scss');

export default {
  data() {
    return {
      formData: {}
    };
  },
  computed: {
    ...mapState(['passwordHash']),
    ...mapGetters(['isLock'])
  },
  mounted() {},
  methods: {
    submit() {      if (!this.formData.password) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.empty'),
          type: 'warning'
        })
      }

      let password = password1(this.formData.password)
      let passwordHash = password2(this.formData.password)
      if (passwordHash != this.passwordHash) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.error'),
          type: 'warning'
        })
      }
      chrome.browserAction.setIcon({
        path : '../icons/metahub-128.png'
      });
      this.$store.dispatch('setIsLock', false)
      this.$store.dispatch('setPassword', password);
    }
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: PingFang SC;
}

.app-window {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/deep/ .el-message-box {
  width: 280px;
}

* {
  box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.app-unlock {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  header {
    height: 45%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    .logo {
      display: block;
      width: 80px;
    }

    .tip {
      margin-top: 30px;
      line-height: 20px;
      text-align: center;
      font-size: 16px;
      color: #333;
    }
    .tip2 {
      margin-top: 10px;
      font-size: 12px;
      color: #666;
      padding: 0 10px;
      line-height: 1.5em;
    }
  }

  .el-form {
    margin-top: 30px;
    text-align: center;
    width: 260px;
    /deep/ .el-input__prefix {
      padding: 6px;
    }
    /deep/ .el-input__inner {
      padding-left: 36px;
      font-weight: 400;
    }
    .el-input {
      margin-bottom: 25px;
      .prefix-img {
        width: 18px;
        height: 22px;
      }
    }
  }
}
</style>