<template>
  <div class="no-account-container">
    <div class="cover-top">
      <img alt class="logo-img" src="../assets/images/metahub@2x.png">
    </div>
    <div class="tip">{{ $t('password.welcome') }}</div>
    <el-form :inline="true" :model="formData" @submit.native.prevent>
      <el-input :placeholder="$t('password.toUnlock')" type="password" v-model="formData.password">
      </el-input>

      <el-button
        @click="submit()"
        class="submit-bottom"
        native-type="submit"
      >{{ $t('password.unlock') }}</el-button>
    </el-form>
  </div>
</template>

<script>
import { password1, password2} from '../util/crypto.js';

export default {
  name: 'PasswordUnlock',
  props: {
    msg: String
  },
  data() {
    return {
      formData: {
        password: ''
      }
    }
  },
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
      if (passwordHash != this.$store.state.passwordHash) {
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('password.error'),
          type: 'warning'
        })
      }
      this.$store.dispatch('setIsLock', false)
      this.$store.dispatch('setPassword', password);
      // 跳转到首页
      this.$router.push('/')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss" >
@import '../assets/css/color.scss';

.no-account-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;

  .cover-top {
    justify-content: center;
  }

  .logo-img {
    width: 120px;
  }

  .tip {
    padding-bottom: 45px;
    padding-top: 130px;
    font-family: PingFangSC-Regular;
    font-size: 26px;
    color: #333333;
    letter-spacing: 0;
    line-height: 24px;
  }
  .el-form {
    text-align: center;
    width: 273px;
    /deep/ .el-input__prefix {
      padding: 6px;
    }
    /deep/ .el-input__inner {
      padding-left: 36px;
      font-weight: 400;
      background: #F8F8F8;
      border-radius: 25px;
      height: 55px;
      border-color: #eee;
      color: #333;
      &:focus{
        border-color: $primary-color;
      }
    }
    .el-input {
      padding-bottom: 20px;

    }

    .submit-bottom {
      width: 273px;
      height: 50px;
      background: linear-gradient(140deg, #DA00F2 0%, #BF01FA 100%, #BF01FA 100%);
      box-shadow: 0px 2px 6px 0px rgba(210,0,244,0.09);
      border-radius: 50px;
      width: 273px;
      font-weight: 400;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: auto;
      &:active{
        border-color: $primary-color;
      }
    }
  }
}
</style>
