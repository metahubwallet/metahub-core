<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('wallet.addMoreTokens')"></top-handle>
      <div class="cover-content _effect">
        <div class="setting-group">
          <div class="row">
            <div class="title">{{$t('wallet.contractName')}}:</div>
            <el-input :placeholder="$t('wallet.required')" v-model="contract"></el-input>
          </div>

          <div  class="row">
            <div class="title">{{$t('wallet.symbolName')}}:</div>
            <el-input :placeholder="$t('wallet.required')" v-model="code"></el-input>
          </div>
        </div>
        <div class="bottom-container">
          <el-button @click="handleSubmitAction" class="submit-btn" type="primary">{{$t('wallet.submit')}}</el-button>
        </div>
      </div>
    </div>
    <!-- router -->
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'
import chain from "../../libraries/chain";
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  data() {
    return {
      code: '',
      contract: ''
    }
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale
    },
    ...mapGetters({userTokens: 'currentUserTokens'}),
    ...mapState(['currentChain']),
    ...mapActions[['setCurrentUserTokens']],
  },
  components: {
    TopHandle
  },
  methods: {
    handleLanguageChange(value) {      this.$i18n.locale = value
      this.$store.dispatch('setLanguage', value)
      this.dialogTableVisibleLanguage = false
    },
    async handleSubmitAction() {
      const loading = this.$loading({
        lock: true,
        background: 'rgba(0, 0, 0, 0.6)'
      })
      try {
        const contract = this.contract.toLowerCase();
        const symbol = this.code.toUpperCase();
        const result = await chain.get().getCurrencyStats(contract, symbol);
        if (result && result.max_supply) {
          const [ amount ] = result.max_supply.split(' ');
          const precision = amount.split('.').length > 1 ? amount.split('.')[1].length : 0;
          const token = {
            amount: 0,
            chain: this.currentChain,
            contract: contract,
            symbol: symbol,
            precision: precision,
          };
          const tokenExists = this.userTokens.findIndex(x => x.chain == token.chain && x.contract == token.contract && x.symbol == token.symbol ) >= 0;
          if (tokenExists) {
            this.$message({
              showClose: true,
              offset: 70,
              message: this.$t('wallet.addTokenExist'),
              type: 'error'
            });
            loading.close()
            return;
          }
          
          this.userTokens.push(token);
          this.setCurrentUserTokens(this.userTokens);

          this.$ebus.$emit('refreshTokens', true);

          this.$message({
            showClose: true,
            offset: 70,
            message: this.$t('wallet.addTokenSuccessfully'),
            type: "success"
          });
          loading.close();

          this.$router.go(-1);
          
        } else {
          throw new Error('Currency not found');
        }
      } catch (e) {
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('wallet.addTokenFailed'),
          type: 'error'
        });
        loading.close();
      }
    }
  }
}
// addedSuccessfully
</script>
<style lang="scss" scoped>
@import '../../assets/css/color.scss';

/deep/ .el-input__inner {
  border: 0;
}

.cover-content {
  background-color: #ffffff;
}

.setting-group {
  background-color: #fff;
  border-width: 0px 0 1px 0;
  margin-top: 10px;
  &:first-child {
    margin-top: 15px;
  }
  .row {
    margin-left: 15px;
    margin-right: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    border-bottom: 1px solid $separate-color;
    .title {
      font-size: 15px;
      color: #333333;
      width: 100px;
    }
    .row-icon {
      color: #6bcf44;
    }
  }
}

.bottom-container {
  display: flex;
  justify-content: center;
  .submit-btn {
    margin: 20px auto;
    width: 150px;
    background-color: $primary-color;
  }
}
</style>


