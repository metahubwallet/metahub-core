<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('setting.manageNetworks')"></top-handle>
      <div class="cover-content _effect">
        <el-scrollbar class="full">
          <!-- 默认节点选择 -->
          <div class="title">{{$t('setting.enableNetwork')}}</div>
          <div class="setting-group">
            <div
              :key="item.name"
              class="setting-item"
              v-for="item in networks"
            >
              <div class="item-titles">
                <div class="item-title">{{item.name}}</div>
                <div class="item-remark">
                  {{item.chainId.substr(0, 24) + '...' + item.chainId.substr(-12)}}
                </div>
              </div>
              <div class="item-btn"><el-button size="mini" icon="el-icon-delete" circle v-show="item.chainId != eosChainId" @click="handleDeleteClick(item)"></el-button></div>
            </div>
          </div>
        </el-scrollbar>
        <div class="bottom-btns">
          <div class="btn" @click="handleAddKnownClick">{{$t('setting.addExistingNetwork')}}</div>
          <div class="btn" @click="handleAddCustomClick">{{$t('setting.addCustomNetwork')}}</div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
import { eosChainId } from '../../util/network';

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      eosChainId,
    }
  },
  computed: {
    ...mapState(['networks']),
    ...mapGetters(['findNetwork']),
  },
  mounted() {

  },
  methods: {
    handleAddKnownClick() {
      this.$router.push({
        path: '/network/addNetwork',
      })
    },
    handleAddCustomClick() {
      this.$router.push({
        path: '/network/addCustomNetwork',
      })
    },
    handleDeleteClick(item) {
      this.$confirm(this.$t('setting.sureDeletePrefix')+item.name+this.$t('setting.sureDeleteSuffix'), this.$t('public.tip'), {
          confirmButtonText: this.$t('password.submit'),
          cancelButtonText: this.$t('password.cancel'),
          type: 'warning'
        }).then(() => {
          this.removeNetwork(item);
        }).catch(() => {});
    },

    removeNetwork(network) {      const widx = this.$store.state.wallets.findIndex(x => x.chainId == network.chainId);
      if (widx >= 0) {
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('setting.alreadyExistAccount'),
          type: 'error'
        });
        return;
      }
      const idx = this.networks.findIndex(x => x.chainId == network.chainId);
      if (idx >= 0) {
        // save
        const networks = this.$store.state.networks;
        networks.splice(idx, 1);
        this.$store.dispatch('setNetworks', networks);
        this.addCustomdialogVisible = false;

        const customRpcs = this.$store.state.customRpcs;
        if (customRpcs[network.chainId]) {
          delete customRpcs[network.chainId];
          this.$store.dispatch('setCustomRpcs', customRpcs);
        }

      }
    }

  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/color.scss';
.full {
  background-color: $background-color;
  position: relative;
  height: calc(100% - 60px);
}

.bottom-btns {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  height: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  line-height: 40px;
  .btn {
    width: 42%;
    height: 40px;
    border-radius: 10px;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    background-color: $primary-color;
    cursor: pointer;
  }
}

.title {
  width: 100%;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  padding: 15px 0 10px 15px;
}

.setting-group {
  border-top: 1px solid $separate-color;
  border-width: 1px 0 1px 0;
  background-color: #fff;
}

.setting-item {
  padding: 10px 0;
  border-bottom: 1px solid $separate-color;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  padding-left: 15px;
  padding-right: 15px;
  // &:last-child {
  //   border-bottom-width: 0;
  // }
  .item-titles {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    line-height: 20px;
    flex: 1;
  }
  .item-title {
    font-size: 16px;
    color: #333;
    line-height: 26px;
  }
  .item-remark {
    line-height: 24px;
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: Consolas, Mono, Menlo, Helvetica, Arial;
  }
}


/deep/ .custom-dialog {
  .el-dialog {
    margin-top: 50px !important;
  }
  .el-dialog__header {
    padding: 10px 10px 5px;
  }
  .el-dialog__body {
    margin: 0;
    padding:  10px 10px 10px 10px;
  }
  .el-dialog__footer {
    padding: 0 10px 10px 10px;
  }
  .el-form-item--mini.el-form-item {
    margin-bottom: 15px;
  }
  .el-form-item--mini .el-form-item__label {
    line-height: 18px;
  }
  .el-form--label-top .el-form-item__label {
    padding: 0;
  }
}
</style>


