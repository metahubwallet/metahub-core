<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('setting.addExistingNetwork')"></top-handle>
      <div class="cover-content _effect">
        <el-scrollbar>
          <el-table
            :data="supportNetworks"
            class="networks"
            style="width: 100%">
            <el-table-column
              prop="name"
              :label="$t('setting.name')"
              width="120">
            </el-table-column>
            <el-table-column
              prop="chainId"
              label="ChainId">
                <template slot-scope="scope">
                  <span>{{scope.row.chainId.substr(0, 16)+'..'}}</span>
                </template>
            </el-table-column>
            <el-table-column
              prop="options"
              :label="$t('setting.operation')"
              align="center"
              width="90">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  v-show="!findNetwork(scope.row.chainId)"
                  icon="el-icon-plus" 
                  @click="handleAddSupportNetwork(scope.$index, scope.row)" 
                  circle
                >
                </el-button>
                <el-button 
                  size="mini" 
                  icon="el-icon-delete" 
                  v-show="findNetwork(scope.row.chainId) && scope.row.chainId != eosChainId" 
                  @click="handleDeleteClick(scope.row)"
                  style="margin-left: 0px;"
                  circle
                >
                </el-button>
                  
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'
import { mapState, mapGetters } from 'vuex'
import _ from 'lodash'
import { eosChainId, supportNetworks } from '../../util/network';

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      eosChainId,
      supportNetworks,
    }
  },
  computed: {
    ...mapState(['networks']),
    ...mapGetters(['findNetwork']),
  },
  mounted() {

  },
  methods: {
    handleAddSupportNetwork(idx, network) {
      if (this.findNetwork(network.chainId)) {
        this.handleDeleteClick(network);
      } else {
        this.$confirm(this.$t('setting.sureAddPrefix')+network.name+this.$t('setting.sureAddSuffix'), this.$t('public.tip'), {
            confirmButtonText: this.$t('password.submit'),
            cancelButtonText: this.$t('password.cancel'),
            type: 'warning'
          }).then(() => {
            this.addNetwork(network);
            this.$router.go(-1);
          }).catch(() => {});
      }
    },
    handleDeleteClick(item) {
      this.$confirm(this.$t('setting.sureDeletePrefix')+item.name+this.$t('setting.sureDeleteSuffix'), this.$t('public.tip'), {
          confirmButtonText: this.$t('password.submit'),
          cancelButtonText: this.$t('password.cancel'),
          type: 'warning'
        }).then(() => {
          this.removeNetwork(item);
          this.$router.go(-1);
        }).catch(() => {});
    },

    addNetwork(network) {
      const networks = this.$store.state.networks;
      networks.push(network);
      this.$store.dispatch('setNetworks', networks);
      const selectedRpc = this.$store.state.selectedRpc;
      selectedRpc[network.chainId] = network.endpoint;
      this.$store.dispatch('setSelectedRpc', selectedRpc);

      const customRpcs = this.$store.state.customRpcs;
      customRpcs[network.chainId] = [ {
        name: network.name,
        endpoint: network.endpoint
      } ];
      this.$store.dispatch('setCustomRpcs', customRpcs);
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

/deep/ .el-scrollbar {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

/deep/ .el-table th.el-table__cell>.cell {
  font-size: 12px;
}

</style>


