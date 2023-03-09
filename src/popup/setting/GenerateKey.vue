<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('setting.generatePublicKey')"></top-handle>
      <div class="cover-content _effect">
        <el-container class="full-router">
          <div class="dialog-container-div">
            <div class="dialog-cell">
              <div class="dialog-cell-left">{{ $t('setting.newPublicKey') }}</div>
              <div class="dialog-cell-mid">{{ publicKey }}</div>
              <div class="dialog-cell-right">
                <el-button @click="generateKeyClicked" class="dialog-change-button" v-clipboard:copy="publicKey" v-clipboard:error="onError" v-clipboard:success="onCopy">{{ $t('setting.copy') }}</el-button>
              </div>
            </div>
            <div class="dialog-cell">
              <div class="dialog-cell-left">{{ $t('setting.newPrivateKey') }}</div>
              <div class="dialog-cell-mid">{{ privateKey }}</div>
              <div class="dialog-cell-right">
                <el-button @click="generateKeyClicked" class="dialog-change-button" v-clipboard:copy="privateKey" v-clipboard:error="onError" v-clipboard:success="onCopy">{{ $t('setting.copy') }}</el-button>
              </div>
            </div>
            <div class="dialog-tip">
              <div class="dialog-tip-one">{{ $t('setting.notice') }}</div>
              <div class="dialog-tip-one">- {{ $t('setting.generateTipOne') }}</div>
              <div class="dialog-tip-one">- {{ $t('setting.generateTipTwo') }}</div>
              <div class="dialog-tip-one">- {{ $t('setting.generateTipThree') }}</div>
            </div>
          </div>
        </el-container>
      </div>
    </div>
  </div>
</template>

<script>
import TopHandle from '../TopHandle.vue';

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      account: this.$route.query,
      publicKey: '',
      privateKey: ''
    };
  },
  async mounted() {
    let result = await getRandomPairKey();
    this.publicKey = result.data.publicKey;
    this.privateKey = result.data.privateKey;
  },
  methods: {
    backClicked() {
      this.$router.go(-1);
    },
    generateKeyClicked() {
      this.$router.push({
        path: '/dialog/generate',
        query: this.account
      });
    },
    onCopy() {
      this.$message({
        showClose: true,
        offset: 70,
        message: this.$t('setting.copySuccess'),
        type: 'success'
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
.dialog-container-div {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 15px 15px 15px 15px;
  font-size: 18px;
  color: #666666;

  /deep/ .dialog-cell {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    border-bottom: 1px solid #f2f2f2;

    .dialog-cell-left {
    }
    .dialog-cell-mid {
      word-break: break-all;
      white-space: normal;
      color: yellow;
      width: 210px;
      text-align: left;
      margin-left: 15px;
      margin-right: 15px;
    }
    .dialog-cell-right {
      color: #999999;
    }

    .dialog-change-button {
      height: 24px;
      text-align: center;
      vertical-align: middle;
      line-height: 0px;
      padding: 0 12px;
      border: 0;
      background-color: #e7faf7;
      border-radius: 12px;
      font-size: 13px;
    }
  }
  .dialog-tip {
    margin-top: 20px;
    font-size: 16px;
    color: #999999;
    .dialog-tip-one {
      margin-top: 6px;
    }
  }
}

.cover-content {
  display: flex;
  flex-direction: column;
  .header {
    background-color: #4a8fe2;
    padding-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-main {
    background-color: #e8ecf0;
  }
  .header-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .header-right {
    display: flex;
    flex-direction: flex-start;
    justify-content: flex-end;
    align-items: center;
  }

  .token-count-tip {
    font-size: 18px;
    margin-left: 12px;
    color: #ffffff;
    letter-spacing: 0;
  }

  /deep/ .import-dialog,
  .el-dialog__wrapper {
    border-radius: 6px;
    overflow-y: hidden;
    overflow-x: hidden;
  }

  /deep/ .import-dialog .el-dialog {
    width: 450px;
    border-radius: 6px;

    .el-dialog__header {
      padding: 0px;
    }
    .el-dialog__body {
      padding: 0px;
    }
    .login-content-div {
      width: 450px;
      min-height: 500px;
      background-color: #010e1d;
    }
  }
}
</style>
