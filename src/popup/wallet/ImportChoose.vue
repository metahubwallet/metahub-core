<template>
  <div @click="handleBGClick" class="box-container">
    <div class="title-cell">
      <div class="title">{{ $t('auth.chooseAccount') }}</div>
      <div class="action">
        <div @click="handleImportClick" class="import-button" > {{ $t('wallet.importSelectedWallets') }} </div>
        <el-checkbox v-model="selectAll" @change="handleSelectAllChange">{{ $t('public.selectAll') }}</el-checkbox>
      </div>
      
    </div>
    <div class="list-container">
      <div
        :key="item.index"
        @click="handleAccountClick(item)"
        class="account-cell"
        v-for="item in wallets"
      >
        <div class="account-left">
          <div class="account-left-name">
            {{item.chainName}}：
            <span style="color:#666666;">{{item.name}}</span>
          </div>
          <div class="account-left-key">
            <div class="span-left">{{item.publicKey}}</div>
            <div class="span-right">{{item.publicKey}}</div>
          </div>
        </div>
        <img v-if="item.isSelected === true" class="close" src="../../assets/images/account_select@2x.png" >
      </div>
      <!-- <div @click="handleImportClick" class="import-wallet">
        <div>{{ $t('public.importWallet') }}</div>
        <img class="bg-img" src="../../assets/images/right_arrow@2x.png">
      </div>-->
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex';

export default {
  props: ['accountList'],
  data() {
    return {
      wallets: [],
      selectAll: true,
    }
  },
  computed: {
    ...mapGetters(['findNetwork']),
  },
  mounted() {		let wallets = _.cloneDeep(this.accountList);
    for (const index in wallets) {
			let wallet = wallets[index]
			wallet.index = index;
      let network = this.findNetwork(wallet.chainId);
      wallet.chainName = network ? network.name : 'Unknown';
			wallet.isSelected = true;
		}
		this.wallets = wallets;
  },
  methods: {
    handleBGClick(event) {
      event.stopPropagation()
    },
    handleCloseClick(event) {
      this.$emit('close-click')
    },
    handleAccountClick(wallet) {      //this.$store.state.selectedIndex = account.index
      wallet.isSelected = !wallet.isSelected
      for (const walletRow of this.wallets) {
        if (!walletRow.isSelected) {
          this.selectAll = false;
          break;
        }
        this.selectAll = true;
      }
    },
    handleSelectAllChange () {
      for (const wallet of this.wallets) {
        if (!this.selectAll) {
          wallet.isSelected = false;
        } else {
          wallet.isSelected = true;
        }
      }
    },
    handleImportClick() {
			let selectedWallets = [];
			for (const wallet of this.wallets) {
				if (wallet.isSelected) {
					selectedWallets.push(this.accountList[wallet.index])
				}
			}
      this.$emit('import-click',selectedWallets)
		}
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/color.scss';
.bg-img {
  width: 7.5px;
  height: auto;
  margin-right: 15px;
}
.import-button{
	//border: 1px solid $primary-color;
	border-radius: 4px;
	padding: 0 8px;
	font-size: 12px;
  line-height: 28px;
	//color: $primary-color;
  background-color: $primary-color;
  color: #fff;
	margin-right: 10px;
	cursor: pointer;
}

.close {
  width: 25px;
  height: auto;
  margin-right: 15px;
}
.box-container {
  background-color: white;
  font-size: 16px;

  .title-cell,
  .import-wallet {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .import-wallet {
    height: 65px;
    margin-left: 15px;
  }

  .list-container {
    max-height: 400px;
    overflow-x: hidden;
    overflow-y: auto;
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

  .title-cell {
    font-size: 16px;
    color: #333333;
    height: 40px;
    border-bottom: 1px solid $separate-color;
    .title {
      margin-left: 10px;
    }
    .action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-right: 15px;
    }
  }

  .account-cell {
    margin-left: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 65px;
    border-bottom: 1px solid $separate-color;

    .account-left {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .account-left-name {
        font-size: 15px;
        color: #333333;
        font-weight: 600;
      }
      .account-left-key {
        color: #666666;
        display: flex;
        flex-direction: row;
        font-size: 13px;
        width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .span-left {
          width: 50%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          background-color: white;
        }
        .span-right {
          width: 50%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          direction: rtl;
          background-color: white;
          margin-left: -20px;
        }
      }
    }
  }
}
</style>
