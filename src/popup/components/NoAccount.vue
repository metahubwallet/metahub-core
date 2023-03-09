<template>
  <div class="no-account-container">
    <div class="no-account-tip">{{ $t('public.noImport') }}</div>
    <img alt class="no-account-img" src="../../assets/images/import-btn.png" @click="nextPage">
    <div class="no-account-btn">{{ $t('public.importAccountNow') }}</div>
    <div class="free-signup" @click="signupClick()">{{ $t('public.freeSignup') }}</div>
  </div>
</template>

<script>
export default {
  props: {
    msg: String
  },
  methods: {
    nextPage() {
      this.$router.push('/wallet/import')
    },
    signupClick() {
      window.open('https://totoro.finance/tools/create-account', '_blank');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss" >
@import '../../assets/css/color.scss';
.no-account-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;

  .no-account-img {
    margin-top: 52px;
    width: 156px;
    height: 156px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .no-account-tip {
    font-size: 13px;
    color: #222;
    letter-spacing: 0;
    margin-top: 100px;
    font-weight: 400;

  }
  .no-account-btn {
    font-size: 26px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #AF00CD;
    line-height: 37px;
  }

  .free-signup {
    position: absolute;
    left: 0;
    bottom: 25px;
    font-size: 16px;
    line-height: 24px;
    width: 100%;
    height: 24px;
    text-align: center;
    cursor: pointer;
  }
}
</style>
