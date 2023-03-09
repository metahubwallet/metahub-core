<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle
        :back-text="$t('auth.back')"
        :title="$t('wallet.receive')"
      ></top-handle>
      <div class="cover-content _effect">
        <div class="full">
          <div class="coin-picker">
            <!-- <el-dropdown>
              <span class="el-dropdown-link">
                {{this.format}} {{ $t('wallet.format') }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="changeFormat('TekenPocket')"
                >TekenPocket {{ $t('wallet.format') }}</el-dropdown-item>
                <el-dropdown-item
                  @click.native="changeFormat('MEET.ONE')"
                >MEET.ONE {{ $t('wallet.format') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>-->
          </div>

          <div class="coin-other">
            <div class="coin-other1">
              {{ network.name }} {{ $t("wallet.accountInfo") }}
            </div>
            <div class="coin-other2">
              {{ briefAccount(account.account) }}
              <img
                v-if="!isCopied"
                @click="handleCopyClick()"
                class="account-cell-key-copy"
                src="../../assets/images/account_copy2.png"
                v-clipboard:copy="account.account"
                v-clipboard:error="onError"
                v-clipboard:success="onCopy"
              />
              <span v-else>Copied!</span>
            </div>
            <div class="coin-other3">
              <!-- <img style="border:none;height:210px;width:210px;" src="../../../assets/temp_qrcode.png" /> -->
              <canvas class="qrcode_box" id="qrccode-canvas"></canvas>
            </div>

            <!--        <div class="coin-other-input">-->
            <!--          <el-input-->
            <!--            :placeholder="$t('wallet.setAmount')"-->
            <!--            @keyup.native="number('amount')"-->
            <!--            v-model="amount"-->
            <!--          >-->
            <!--          <template slot="append">-->
            <!--              {{ symbol }}-->
            <!--            </template>-->
            <!--          </el-input>-->
            <!--        </div>-->

            <!--        <div class="coin-other4">-->
            <!--          <el-button @click="copyAccount" class="copy">{{ $t('wallet.copyAccountName') }}</el-button>-->
            <!--        </div>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import TopHandle from "../TopHandle.vue";
import { mapGetters, mapState } from "vuex";
import { briefAccount } from "../../util/utils"
let canvas = "";

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      format: "TekenPocket",
      symbol: this.$store.getters.currentSymbol,
      contract: "eosio.token",
      amount: "",
      network: {},
      isCopied: false
    };
  },
  computed: {
    ...mapState(["currentChainId"]),
    ...mapGetters({ account: "currentWallet", findNetwork: "findNetwork" })
  },
  mounted() {
    this.network = this.findNetwork(this.currentChainId);
    this.symbol = this.$route.query.symbol
      ? this.$route.query.symbol
      : this.$store.getters.currentSymbol;
    this.contract = this.$route.query.contract
      ? this.$route.query.contract
      : "eosio.token";
    // 生成二维码
    this.draw();
  },
  methods: {
    number(key) {
      if (this[key]) {
        this[key] = this[key].replace(/[^\.\d]/g, "");
      } else {
        this[key] = "";
      }
      this.draw();
    },
    briefAccount(account) {
      return briefAccount(account, 10, 8);
    },
    copyAccount() {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", this.account.account);
      input.select();
      if (document.execCommand("copy", this.account.account)) {
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t("wallet.copied"),
          type: "success"
        });
      } else {
        this.$message({
            showClose: true,
            offset: 70,
            message: this.$t('setting.copyFailure'),
            type: 'error'
          });
      }
      document.body.removeChild(input);
    },
    backClicked() {
      this.$router.go(-1);
    },
    changeFormat(val) {
      this.format = val;
      // 生成对应的二维码
      this.draw();
    },
    handleCopyClick() {
      event.stopPropagation();
    },
    onCopy() {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 1000);
    },
    onError() {
      this.$message({
          showClose: true,
          offset: 70,
          message: "copied failed",
          type: 'error'
        });
    },
    draw() {
      canvas = document.getElementById("qrccode-canvas");
      // 旧版格式
      // let data = {
      //   protocol: 'MEET.ONE',
      //   action: 'navigate',
      //   amount: '0', // 可选  真实转账数量
      //   contract: this.contract, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段symbol、precision保持匹配
      //   symbol: this.symbol, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段contract、precision保持匹配
      //   address: this.account.name, // 转账目标地址
      //   precision: 4, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段contract、symbol保持匹配
      //   blockchain: this.$store.state.currentChainId, // BTC, ETH, EOS, BOS, MEET.ONE
      //   type: 19,
      //   memo: '', // 可选 备注信息
      //   target: 'EOSTransferPage',
      //   to: this.account.name
      // }
      // ScanProtocol

      let to = this.account.name;
      let memo = '';
      if (this.account.account > 12) {
        to = 'etheraccount';
        memo = this.account.account;
      }

      let data = {
        protocol: "ScanProtocol",
        action: "transfer",
        address: to, // 转账目标地址
        contract: this.contract, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段symbol、precision保持匹配
        symbol: this.symbol, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段contract、precision保持匹配
        precision: 4, // 可选，可以指定token，也可以由钱包扫码后自行选择转帐token，需要与字段contract、symbol保持匹配
        blockchain: this.network.chain.toUpperCase(), // BTC, ETH, EOS, BOS, MEET.ONE
        amount: this.amount == "" ? "0" : this.amount, // 可选  真实转账数量
        memo, // 可选 备注信息
      };

      // if (this.format == "TekenPocket") {
      //   data = {
      //     amount: "0",
      //     contract: this.contract,
      //     symbol: this.symbol,
      //     precision: 4,
      //     type: 19,
      //     address: this.account.name
      //   };
      // } else {
      //   data = {
      //     protocol: "MEET.ONE",
      //     action: "navigate",
      //     target: "EOSTransferPage",
      //     to: this.account.name
      //   };
      // }
      QRCode.toCanvas(
        canvas,
        JSON.stringify(data),
        { errorCorrectionLevel: "M", scale: 6, width: 210, margin: 1 },
        error => {
          if (error) {          } else {
            canvas = document.getElementById("qrccode-canvas");
          }
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.full {


  .token-count-tip {
    font-size: 18px;
    margin-left: 12px;
    color: #ffffff;
    letter-spacing: 0;
  }

  .coin-picker {
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-right: 20px;
  }

  .coin-other {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .coin-other1 {
    margin-bottom: 9px;
    font-size: 14px;
    color: #7f7f7f;
    letter-spacing: 0;
  }
  .coin-other2 {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
    color: #222;
    letter-spacing: 0;
    img{
      width: 14px;
      height: 14px;
      margin-left: 5px;
      cursor: pointer;
    }
    span{
      margin-left: 10px;
      color: #888;
    }
  }
  .coin-other3 {
    margin-bottom: 30px;
    height: 210px;
    width: 210px;
  }
  .coin-other4 {
    margin-bottom: 50px;
    height: 40px;
    width: 210px;
    font-size: 16px;
    // color: #4a8fe2;
    // letter-spacing: 0;
    text-align: center;
  }
  .copy {
    height: 44px;
    width: 210px;
    // color: #4a8fe2;
    // background-color: #e8ecf0;
    // border-color: #4a8fe2;
  }
  .coin-other-input {
    margin-bottom: 15px;
    height: 40px;
    width: 210px;
  }
}
</style>
