<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('wallet.transfer')"></top-handle>
      <div class="cover-content _effect">
        <el-container>
          <el-form :inline="true" :model="formData">
            <div class="transfer-title">{{ $t('wallet.paymentAccount') }}</div>
            <div class="transfer-input">
              <el-input :disabled="true" :value="formData.from"></el-input>
            </div>

            <div class="transfer-title">
              {{ $t('wallet.receiverAccount') }}
              <a class="transfer-title-recent" href="#" @click="handleRecentClick">
                <svg-icon icon-class="history"></svg-icon>
              </a>
            </div>
            <div class="transfer-input">
              <el-tooltip v-model="receiverError" :class="(receiverError ? 'transfer-error' : '')" popper-class="transfer-popper" effect="light" :content="receiverErrorMsg" placement="top" :manual="true" :hide-after="0">
                <el-input @blur="blur('receiver')" v-model="formData.receiver"></el-input>
              </el-tooltip>
            </div>

            <div class="transfer-title">
              {{ $t('wallet.amount') }}
            </div>
            <div class="transfer-input">
              <el-tooltip v-model="quantityError" :class="(quantityError ? 'transfer-error' : '')" popper-class="transfer-popper" effect="light" :content="quantityErrorMsg" placement="top" :manual="true" :hide-after="0">
                <el-input :placeholder="selectedToken.amount + ' ' + selectedToken.symbol" @blur="blur('quantity')" @keyup.native="number('quantity')" ref="quantityVal" v-model="formData.quantity">
                  <div class="el-input__icon transfer-input-all" slot="suffix" @click="allClick">{{ $t('wallet.all') }}</div>
                  <template slot="append">
                    <el-button @click="handleTokenClick" class="symbol-button" type="text">
                      {{ selectedToken.symbol }}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </template>
                </el-input>
              </el-tooltip>
            </div>

            <div class="transfer-title" v-show="showMemo">{{ $t('wallet.remark') }}（Memo）</div>
            <div class="transfer-input" v-show="showMemo">
              <el-input v-model="formData.memo"></el-input>
            </div>

            <div class="transfer-buttons">
              <el-button :loading="submitLoading" @click="beforeSubmit()" class="primary-button">{{ $t('wallet.transfer') }}</el-button>
            </div>
          </el-form>
        </el-container>
      </div>

      <el-dialog :modal-append-to-body="false" :title="$t('wallet.symbols')" :visible.sync="selectedTokensVisible" class="selectedToken-dialog">
        <el-scrollbar>
          <div class="el-table-container">
            <el-table :data="userTokens" @row-click="handleTokenChange">
              <el-table-column :label="$t('wallet.symbol')" align="center" property="symbol" width="200px;">
                <template slot-scope="scope">
                  <div class="symbol-template">
                    <img class="symbol-left" v-lazy="scope.row.logo ? imageURL + scope.row.logo : require('../../assets/images/eos_icon.png')">
                    <div class="symbol-right">
                      <div class="symbol-right-symbol">{{ scope.row.symbol }}</div>
                      <div class="symbol-right-contract">{{ scope.row.contract }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <!-- <el-table-column :label="$t('wallet.symbol')" property="symbol"></el-table-column> -->
              <!-- <el-table-column property="contract" :label="$t('wallet.contract')" width="150"></el-table-column> -->
              <el-table-column :label="$t('wallet.balance')" align="right" property="amount"></el-table-column>
            </el-table>
          </div>
        </el-scrollbar>
      </el-dialog>

      <el-dialog :modal-append-to-body="false" :title="$t('wallet.recentTransfers')" :visible.sync="recentVisible" class="selectedToken-dialog">
        <el-scrollbar>
          <div class="el-table-container">
            <el-table :data="recentTransfers" @row-click="handleRecentAccountclick">
              <el-table-column property="account" :label="$t('wallet.receiverAccount')" width="170">
                <template slot-scope="scope">
                  <span v-if="scope.row.account.length == 42" :title="scope.row.account">{{ scope.row.account.substring(0,10) }}...{{ scope.row.account.substring(36) }}</span>
                  <span v-else>{{ scope.row.account }}</span>
                </template>
              </el-table-column>
              <el-table-column property="time" :label="$t('wallet.transationTime')" align="center" width="130"></el-table-column>
            </el-table>
          </div>
        </el-scrollbar>
      </el-dialog>

      <section @click="handleBGClick" class="confirm-box" v-show="showConfirm">
        <TransferConfirm
          ref="confirm"
          @submit-click="onSubmit"
          @close-click="handleBGClick"
          :transfer="formData"
          :precision="selectedToken.precision"
        ></TransferConfirm>
      </section>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";
import chain from '../../libraries/chain';
import { briefAccount } from '../../util/utils';
import TopHandle from '../TopHandle.vue';
import TransferConfirm from './TransferConfirm';
import moment from 'moment'

export default {
  props: ['contract','symbol'],
  components: {
    TopHandle,
    TransferConfirm
  },
  data() {
    return {
      receiverError: false,
      receiverErrorMsg: '',
      quantityError: false,
      quantityErrorMsg: '',
      formData: { memo: '' ,quantity:'',receiver:'',from:'',symbol:'',contract:''},
      selectedTokensVisible: false,
      recentVisible: false,
      selectedToken: {},
      submitLoading: false,
      imageURL: '', 
      showMemo: true,
      showConfirm: false, 
    };
  },
  computed: {
    ...mapGetters({ account: 'currentWallet', currentNetwork: 'currentNetwork', userTokens: 'currentUserTokens' }),
    ...mapState(['recentTransfers']),
    recentTransfers() {
      return this.$store.state.recentTransfers.map(x => { 
        return { ...x, time: moment(x.time).format("MM-DD HH:mm") };
      });
    }
  },
  created() {
    const currentSystemToken = this.currentNetwork.token;
    
    this.selectedToken = this.$route.query.symbol ? this.$route.query : currentSystemToken;
    if (!this.selectedToken.contract) {
      this.selectedToken.contract = 'eosio.token';
    }
    if (!this.selectedToken.amount) {
      this.selectedToken.amount = 0;
    }
    if (!this.selectedToken.precision) {
      this.selectedToken.precision = 4;
    }    this.userTokens.forEach(row => {
      if (row.contract == this.selectedToken.contract && row.symbol == this.selectedToken.symbol) {
        this.selectedToken.amount = row.amount;
        this.selectedToken.precision = row.precision;      }
    });
    this.formData.from = briefAccount(this.account.account, 14, 8);
    this.formData.symbol = this.selectedToken.symbol;
    this.loadBalance();
  },
  methods: {
     ...mapActions(['addRecentTransfers']),
    allClick() {
      this.formData.quantity = this.selectedToken.amount;
      this.$refs.quantityVal.focus();
      // this.$refs.quantityVal.setCurrentValue(this.formData.quantity);
    },
    handleBGClick() {
      this.showConfirm = false
    },
    backClicked() {
      this.$router.go(-1);
    },
    handleRecentAccountclick(val) {      this.recentVisible = false;
      this.receiverError = false;
      this.receiverErrorMsg = '';
      this.formData.receiver = val.account;
      this.formData.memo = val.memo;
      this.blur('receiver');
    },
    handleTokenChange(val) {      this.selectedToken.contract = val.contract;
      this.selectedToken.symbol = val.symbol;
      this.selectedToken.precision = val.precision;
      this.selectedToken.amount = val.amount;
      this.selectedTokensVisible = false;
      this.formData.quantity = '';
      this.loadBalance();
    },
    async loadBalance() {
      const balance = await chain.get().getCurrencyBalance(this.selectedToken.contract, this.account.name, this.selectedToken.symbol);
      if (balance) {
        this.selectedToken.amount = balance.split(' ')[0];
      }
    },
    number(key) {
      if (this.formData[key]) {
        this.formData[key] = this.formData[key].replace(/[^\.\d]/g, '');
        if (key == 'quantity') {
          if (this.selectedToken.amount < parseFloat(this.formData[key])) {
            this.formData[key] = this.selectedToken.amount;
          }
        }
      }
    },
    async beforeSubmit() {
      this.formData.symbol = this.selectedToken.symbol;
      this.formData.contract = this.selectedToken.contract;
      if (!this.formData.receiver || this.formData.receiver == '') {
        this.receiverError = true;
        this.receiverErrorMsg = this.$t('wallet.emptyReceiver');
      } else {
        if (this.formData.receiver.length != 42 && this.formData.receiver.length > 12) {
          this.receiverError = true;
          this.receiverErrorMsg = this.$t('wallet.errorReceiver');
        }
      }
      if (!this.formData.quantity || this.formData.quantity == 0) {
        this.quantityError = true;
        this.quantityErrorMsg = this.$t('wallet.emptyAmount');
      }

      if (this.receiverError || this.quantityError) {
        return;
      }

      // 检查现在是否需要输入密码
      this.showConfirm = true;       // var accounts = [
      //   '1314.tp',
      //   '3qi513yykfdb',
      //   'aagamesselectedToken'
      // ]

      //验证账号是否都能在主网查询到
      // for (let i = 0; i < accounts.length; i++) {
      //   try {
      //     let accountData = await chain.get().getAccount(accounts[i])
      //   } catch (e) {      //   }
      // }
    },

    async onSubmit() {
      if (this.receiverErrorMsg != '' || this.quantityErrorMsg != '') {
        return;
      }

      try {
        this.submitLoading = true;
        let receiver = this.formData.receiver;
        let memo = this.formData.memo;
        const isEthAddress = receiver.length == 42;
        if (isEthAddress) {
          // receiver = await chain.get().transfer(...params, chain.getAuth());
          // if (this.formData.contract == 'eosio.token' && this.selectedToken.symbol == 'EOS') {
          //   receiver = 'etheraccount';
          //   memo = this.formData.receiver;
          // }
          receiver = 'etheraccount';
          memo = this.formData.receiver;
        }

        // 验证密码
        this.formData.quantity = parseFloat(this.formData.quantity).toFixed(this.selectedToken.precision);
        this.formData.quantity = this.formData.quantity + ' ' + this.selectedToken.symbol;
        let recent = {
          account: this.formData.receiver,
          time: Date.now(),
          memo: isEthAddress ? '' : this.formData.memo,
        };
        this.addRecentTransfers(recent);
        const params = [
          this.formData.contract,
          this.account.name,
          receiver,
          this.formData.quantity,
          memo,
        ];
        await chain.get().transfer(...params, chain.getAuth());
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('wallet.transferSuccess'),
          type: 'success'
        });
        // 返回主页 并刷新数据
        // this.account.homePageData = null;
        this.$ebus.$emit('refreshTokens', true);
        this.$router.push('/');
      } catch (e) {        
        this.$message({
          showClose: true,
          offset: 70,
          message: chain.getErrorMsg(e),
          type: 'error',
          duration: 5000
        });
        
      } finally {
        this.$refs.confirm.resetForm();
        this.submitLoading = false;
      }
      
    },
    async blur(type) {
      if (type == 'receiver') {
        if (!this.formData.receiver || this.formData.receiver == '') {
          this.receiverError = true;
          this.receiverErrorMsg = this.$t('wallet.emptyReceiver');
          return;
        }
        if (this.formData.receiver == this.account.name) {
          this.receiverError = true;
          this.receiverErrorMsg = this.$t('wallet.transferSelf');
          return;
        }
        // 账号不存在
        if (this.formData.receiver.length == 42) {
          this.showMemo = false;
        } else {
          this.showMemo = true;
          let accountData = await chain.get().getAccount(this.formData.receiver);
          if (accountData == null) {
            this.receiverError = true;
            this.receiverErrorMsg = this.$t('wallet.accountNotExist');
            return;
          }
        }        this.receiverError = false;
        this.receiverErrorMsg = '';
      } else {
        const quantity = isNaN(this.formData.quantity) ? 0 : parseFloat(this.formData.quantity);
        if (quantity == 0) {
          this.quantityError = true;
          this.quantityErrorMsg = this.$t('wallet.emptyAmount');
          return;
        }
        if (quantity < 0) {
          this.quantityError = true;
          this.quantityErrorMsg = this.$t('wallet.emptyAmount');
          return;
        }
        this.quantityError = false;
        this.quantityErrorMsg = '';
      }
      return true;
    },
    handleRecentClick() {
      this.receiverError = false;
      this.quantityError = false;
      this.recentVisible = true;
    },
    handleTokenClick() {
      this.receiverError = false;
      this.quantityError = false;
      this.selectedTokensVisible = true
    }
  }
};
</script>

<style lang="scss">
.transfer-popper.is-light  {
  border-color: #be0f0f;
  .popper__arrow {
    border-top-color: #be0f0f;
  }
}
</style>

<style lang="scss" scoped>
@import '../../assets/css/color.scss';

.el-container {
  background-color: #fff;
  flex-direction: column;
  
  .el-form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .selectedToken-count-tip {
    font-size: 18px;
    margin-left: 12px;
    color: #ffffff;
    letter-spacing: 0;
  }

  .transfer {
    font-family: PingFang SC;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .transfer-title {
    margin-top: 22px;
    width: 300px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    color: #333;
    letter-spacing: 0;
    .transfer-title-recent {
      margin-top: 2px;
      float: right;
      .svg-icon {
        width: 20px;
        height: 20px;
        color: #666;
      }
    }
  }
  .transfer-input {
    margin-top: 8px;
    height: 46px;
    width: 300px;
    .transfer-input-all {
      cursor: pointer;
      // border: 1px solid #dcdfe6;
      // border-radius: 12px;
      font-size: 10px;
      width: 45px;
    }
    /deep/ .el-input__prefix {
      padding: 6px;
    }
    /deep/ .el-input__inner {
      padding-left: 20px;
      font-weight: 400;
      background: #F8F8F8;
      border-radius: 20px;
      height: 46px;
      border-color: #eee;
      color: #333;
      font-size: 14px;
      transition: none;
      &:focus{
        border-color: $primary-color;
      }
      &:focus + span + div {
        border-color: $primary-color;
      }
    }
    /deep/ .el-input--suffix .el-input__inner {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right-width: 0;
    }
    /deep/ .el-input--suffix .el-input-group__append {
      background: #F8F8F8;
      border-color: #eee;
      border-radius: 0 20px 20px 0;
      height: 46px;
      font-weight: 400;
      background: #F8F8F8;
    }
    /deep/ .transfer-error .el-input__inner {
      border-color: #be0f0f;
      & + span + div {
        border-color: #be0f0f;
      }
    }
  }

  .transfer-buttons {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    left: 0;
    right: 0;
    bottom: 0;
    .primary-button {
      bottom: 40px;
      height: 50px;
      width: 300px;
    }
  }

  /deep/ .el-input-group__append {
    text-align: center;
  }

  .symbol-button {
    padding: 0 10px;
  }

}

.confirm-box {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column-reverse;
}

/deep/ .el-dialog {
  font-family: PingFang SC;
  border-radius: 6px;
  width: 90%;
  .el-dialog__header {
    border-bottom: #f2f2f2 1px solid;
  }
  .el-dialog__body {
    padding: 0px;
  }
}

/deep/ .el-scrollbar {
  height: 400px;
  width: 100%;
  overflow-x: hidden;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}
    
/deep/ .el-table-container {
  padding: 0 15px;
  .el-table {
    .el-table__cell {
      padding: 8px 0;
    }
    .cell {
      padding: 0 10px;
    }
    .symbol-template {
      display: flex;
      flex-direction: row;
      align-items: center;
      .symbol-left {
        height: 40px;
        width: 40px;
        margin-right: 15px;
        cursor: pointer;
      }
      .symbol-right {
        display: flex;
        flex-direction: column;
        text-align: left;
        .symbol-right-symbol {
          line-height: 22px;
           font-size: 16px;
        }
        .symbol-right-contract {
          font-weight: 400;
          font-size: 12px;
          line-height: 18px;
        }
      }
    }
  }
}


</style>

