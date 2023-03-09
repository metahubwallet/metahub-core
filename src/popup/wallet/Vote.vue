<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('wallet.vote')">
        <template slot="right">
          <img
            @click="handleTipClick"
            class="vote-tip"
            src="../../assets/images/vote_question@2x.png"
          >
        </template>
      </top-handle>
      <div class="cover-content _effect">
        <el-container>
          <el-menu
            :default-active="activeIndex"
            @select="handleSelect"
            class="el-menu-demo"
            mode="horizontal"
          >
            <el-menu-item index="1">{{ $t('wallet.vote') }}</el-menu-item>
            <el-menu-item index="3">{{ $t('wallet.voted') }}</el-menu-item>
          </el-menu>

          <div class="separate-line"></div>
          <el-input
            :placeholder="$t('wallet.searchKeyWord')"
            class="search-input"
            size="mini"
            v-model="search"
          />
          <div class="scroll-bar-view" v-loading="loading">
            <el-scrollbar>
              <div class="point-container-div">
                <el-table
                  :data="tableData.filter(data => !search || data.account.toLowerCase().includes(search.toLowerCase()) || data.account.toLowerCase().includes(search.toLowerCase()))"
                  :show-header="false"
                >
                  <el-table-column property="name" width="80">
                    <template slot-scope="scope">
                      <img
                        @mouseup="enterDetail(scope)"
                        class="icon-img"
                        v-lazy="imageURL + scope.row.account+'_bp.png!128'"
                      >
                    </template>
                  </el-table-column>
                  <el-table-column property="name">
                    <template slot-scope="scope">
                      <div @mouseup="enterDetail(scope)" class="coin-code">{{scope.row.account}}</div>
                      <div
                        @mouseup="enterDetail(scope)"
                        class="coin-contract"
                      >{{ $t('wallet.rank') }}: {{scope.row.rank}} &nbsp;&nbsp;&nbsp;{{ $t('wallet.area') }}: {{scope.row.area}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column width="60px;">
                    <template slot-scope="scope">
                      <img
                        :src="scope.row.voted ? require('../../assets/images/vote_selected.png') : require('../../assets/images/vote_normal.png')"
                        @mouseup="coinLikeCliked(scope)"
                        style="border:none;height:25px;width:25px;cursor: pointer;"
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-scrollbar>
          </div>

          <el-button
            :disabled="votedButtonDisable"
            @click="votedButtonClicked"
            class="float-button"
            type="primary"
          >{{voteTip}}</el-button>
         </el-container>
      </div>
     
      <transition name="el-fade-in-linear">
        <div @click="handleTipClick" class="tip-massage" v-show="isShowVoteTip">
          <div class="tip-container">
            <img class="vote-tip-img" src="../../assets/images/pop_ups_icon@2x.png">
            <div class="vote-tip-title">{{$t('wallet.nodeVote')}}</div>
            <div class="vote-tip-text">{{$t('wallet.nodeVoteTip1')}}</div>
            <div class="vote-tip-text">{{$t('wallet.nodeVoteTip2')}}</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { getBpInfo } from '../../libraries/remote.js'
import chain from '../../libraries/chain'
import TopHandle from '../TopHandle.vue'
import { mapGetters } from 'vuex'
import { eosChainId } from '../../util/network'

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      imageURL: '', 
      loading: true,
      nodata: true,
      isShowVoteTip: false,
      activeIndex: '1',
      producersData: [],
      tableData: [],
      search: '',
      loading: true,
      votedButtonDisable: true,
      voteTip: this.$t('wallet.vote'),
      accountInfo: {},
      totalStaked: 0,
      selectedArray: []
    }
  },
  computed: {
    ...mapGetters({ account: 'currentWallet' })
  },
  async mounted() {
    await this.getDataList()
    await this.getAccountInfo()
    this.tableData = this.producersData
  },
  methods: {
    backClicked() {
      this.$router.go(-1)
    },
    handleTipClick() {
      this.isShowVoteTip = !this.isShowVoteTip
    },
    handleSelect(key) {      if (key == 1) {
        this.tableData = this.producersData
      } else {
        this.tableData = []
        for (const index in this.producersData) {
          let obj = this.producersData[index]
          if (obj.voted) {
            this.tableData.push(obj)
          }
        }
      }
    },
    updateVoteButton() {
      let selectedCount = 0
      for (const index in this.producersData) {
        let obj = this.producersData[index]
        if (obj.voted) {
          selectedCount++
        }
      }
      if (selectedCount > 0) {
        this.votedButtonDisable = false
        this.voteTip = this.$t('wallet.vote') + ` (${selectedCount})`
      } else {
        // this.votedButtonDisable = true;
        this.voteTip = this.$t('wallet.vote')
      }
    },
    async coinLikeCliked(scope) {
      for (const index in this.producersData) {
        let obj = this.producersData[index]
        if (obj.account == scope.row.account) {
          obj.voted = !obj.voted        }
      }
      this.updateVoteButton()
    },
    enterDetail(scope) {
      // shell.openExternal(scope.row.website);
      if (this.$store.state.currentChainId != eosChainId) return //BOS 没有详情列表
      chrome.tabs.create({ url: scope.row.website })
    },
    votedButtonClicked() {
      this.selectedArray = []
      for (const index in this.producersData) {
        let obj = this.producersData[index]
        if (obj.voted) {
          this.selectedArray.push(obj.account)
        }
      }
      this.selectedArray.sort()
      this.onSubmit()
    },
    async onSubmit() {
      //  按钮不可点
      this.votedButtonDisable = true      try {
        await chain
          .get()
          .voteProducer(
            this.account.name,
            this.selectedArray,
            '',
            chain.getAuth()
          )
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('wallet.voteSuccess'),
          type: 'success'
        })
      } catch (e) {
        this.votedButtonDisable = false
        return this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('public.executeFailure'),
          type: 'error'
        });
      }
      this.activeIndex = 3
      this.tableData = []
      for (const index in this.producersData) {
        let obj = this.producersData[index]
        if (obj.voted) {
          this.tableData.push(obj)
        }
      }
      this.votedButtonDisable = false
    },
    async getDataList() {
      this.loading = true
      let result = await getBpInfo()
      if (result.code == 200) {
        for (const index in result.data) {
          let obj = result.data[index]
          obj.voted = false
        }
        this.producersData = result.data
      } else {
        this.$message({
          showClose: true,
          offset: 70,
          message: result.msg,
          type: 'error'
        });
      }
      this.loading = false
    },
    async getAccountInfo() {
      this.loading = true
      try {
        this.accountInfo = await chain.get().getAccount(this.account.name)
        this.totalStaked =
          parseFloat(this.accountInfo.self_delegated_bandwidth.cpu_weight) +
          parseFloat(this.accountInfo.self_delegated_bandwidth.net_weight)
        this.totalStaked = this.totalStaked.toFixed(4)
        this.selectedArray = this.accountInfo.voter_info.producers

        for (const index in this.producersData) {
          for (const index2 in this.selectedArray) {
            if (
              this.producersData[index].account == this.selectedArray[index2]
            ) {              this.producersData[index].voted = 1
              break
            }
          }
        }
        this.updateVoteButton()
      } catch (e) {
        this.$message({
            showClose: true,
            offset: 70,
            message: chain.getErrorMsg(e),
            type: 'error'
          });
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tip-massage {
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .tip-container {
    background: #ffffff;
    border-radius: 6px;
    height: 355px;
    width: 345px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .vote-tip-img {
      height: 118px;
      width: 128px;
      margin-top: 40px;
    }
    .vote-tip-title {
      font-size: 15px;
      color: #4288fa;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .vote-tip-text {
      margin-top: 10px;
      font-size: 14px;
      color: #333333;
      letter-spacing: 0;
      line-height: 20px;
      margin-left: 13px;
      margin-right: 13px;
    }
  }
}

.vote-page {
  background-color: white;
}
.vote-tip {
  height: 34px;
  width: 22px;
  margin-left: 30px;
  padding-top: 12px;
  cursor: pointer;
}

.el-menu--horizontal > .el-menu-item {
  height: 44px;
  line-height: 44px;
}


.el-menu-demo {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.content-header {
  margin: 0;
  padding: 0;
  .content-header-div {
    height: 100%;
    font-size: 14px;
    color: #7f7f7f;
    letter-spacing: 0;
    text-align: right;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .content-header-div1 {
    margin-left: 30px;
  }

  .content-header-div2 {
    margin-left: 20px;
    font-size: 18px;
    color: #4a8fe2;
    letter-spacing: 0;
  }
  .content-header-div3 {
    margin-left: 14px;
  }
  .footer {
    color: #7f7f7f;
    text-align: center;
  }
  .el-scrollbar {
    height: 100%;
    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
    .el-scrollbar__bar.is-horizontal {
      display: none;
    }
  }
  .content-list {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
    .content-item {
      .content-info-big {
        padding-left: 30px;
        height: 80px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .content-info-left {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        img {
          width: 34px;
          height: 34px;
        }
      }
      .content-info-text {
        height: 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
      }
      .content-info-up {
        padding-left: 14px;
        font-size: 14px;
        color: #4a4a4a;
        letter-spacing: 0;
      }
      .content-info-bottom {
        padding-left: 14px;
        font-size: 12px;
        color: #7f7f7f;
        letter-spacing: 0;
      }

      .content-info-right-red {
        padding-right: 30px;
        font-size: 18px;
        letter-spacing: 0;
        text-align: right;
        color: #e24054;
      }
      .content-info-right-blue {
        padding-right: 30px;
        font-size: 18px;
        letter-spacing: 0;
        text-align: right;
        color: #4a8fe2;
      }
      .separate-line {
        margin-left: 30px;
        margin-right: 30px;
        background-color: #f2f2f2;
        height: 1px;
      }
    }
  }
}

/deep/ .el-container {
  .icon-img {
    height: 40px;
    width: 40px;
    margin-left: 20px;
    border: 1px solid #ebebeb;
    border-radius: 20px;
    cursor: pointer;
  }
  .coin-code {
    font-size: 14px;
    font-weight: 700;
    color: #333333;
    cursor: pointer;
  }
  .coin-contract {
    font-size: 14px;
    color: #999999;
    cursor: pointer;
  }
  .el-table--scrollable-x .el-table__body-wrapper {
    overflow-y: hidden;
    overflow-x: hidden;
  }
  .el-dialog__body {
    padding: 0px;
  }
  .el-dialog__header {
    text-align: center;
  }
  .scroll-bar-view {
    height: 458px;
  }

  .el-scrollbar {
    width: 100%;
    overflow-x: hidden;
    .point-container-div {
      width: 100%;
    }
  }

  .el-input-group__append {
    background-color: #ffffff;
    border-width: 0 0 1px 0;
  }

  .search-input {
    width: 90%;
    margin-left: 5%;
    height: 40px;
    margin-top: 6px;
    margin-bottom: 6px;
  }
}

.float-button {
  position: fixed;
  left: 40%;
  bottom: 10%;
}
</style>

