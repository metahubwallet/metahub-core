<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="network.name"></top-handle>
      <div class="cover-content _effect">
        <el-scrollbar>
          <!-- 默认节点选择 -->
          <div class="title">{{ $t('setting.defaultNodes') }}</div>
          <div class="setting-group default-rpcs" v-loading="loadingHttpApis">
            <div
              :key="item.name"
              @click="handleNodeSelect(item)"
              class="setting-item"
              v-for="item in recommendEndpoints"
            >
              <div class="setting-title">{{item.endpoint}}</div>
              <div class="setting-right">
                <div class="right-text">{{item.delay || ''}}</div>
                <div class="right-icon">
                  <i class="el-icon-check" v-show="selectedHttpApi === item.endpoint"></i>
                </div>
              </div>
            </div>
            <div class="center-text" v-show="recommendEndpoints.length == 0"> {{ $t('public.noData') }}</div>
          </div>

          <!-- 自定义节点选择 -->
          <div class="title custom" v-if="customEndpoints.length">{{ $t('setting.customNodes') }}</div>
          <div class="setting-group custom-rpcs"  v-if="customEndpoints.length">
            <div
              :key="item.endpoint"
              class="setting-item"
              v-for="item in customEndpoints"
            >
              <div @click="handleNodeSelect(item)" class="setting-title">
                {{item.endpoint}}
              </div>
              <div class="setting-delete"><el-button size="mini" icon="el-icon-delete" circle  @click="handleDeleteClick(item)"></el-button></div>
              <div class="setting-right">
                <div class="right-text">{{item.delay}}</div>
                <div class="right-icon">
                  <i class="el-icon-check" v-show="selectedHttpApi === item.endpoint"></i>
                </div>
              </div>
            </div>
          </div>
          <div @click="handleAddClick" class="bottom-btn">{{ $t('setting.addNode') }}</div>
        </el-scrollbar>
        
      </div>
    </div>
    <!-- router -->
    <el-dialog
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      :title="$t('setting.addNode')"
      width="90%"
    >
      <el-input :placeholder="$t('setting.inputNodeAddress')" v-model="userEnterUrl"></el-input>
      <span class="dialog-footer" slot="footer">
        <el-button @click="dialogVisible = false">{{ $t('public.cancel') }}</el-button>
        <el-button @click="addCustomEndpoint" type="primary">{{ $t('public.ok') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'
import chain from '../../libraries/chain'
import { getEndpoints } from '../../libraries/remote'
import Vue from 'vue'
import _ from 'lodash'

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      dialogVisible: false,
      userEnterUrl: '',
      chainId: this.$route.query.chainId,
      network: this.$store.getters.findNetwork(this.$route.query.chainId),
      loadingHttpApis: true,
      recommendEndpoints: [],
      customEndpoints: [],
      selectedHttpApi: '',
    }
  },
  mounted() {
    const customRpcs = this.$store.state.customRpcs[this.chainId];
    this.customEndpoints = Array.isArray(customRpcs) ? customRpcs : [];
    this.selectedHttpApi = this.$store.getters.selectedRpc(this.chainId);
    // ping

    this.loadRecommendEndpoints();

    this.pingCustomEndpoints();
    
  },
  methods: {
    async loadRecommendEndpoints() {
      this.loadingHttpApis = true;
      const endpoints = await getEndpoints(this.chainId);
      if (endpoints && endpoints.length) {
        for (const endpoint of endpoints) {
          endpoint.delay = ''
        }
        this.recommendEndpoints = endpoints;
        this.pingRecommendEndpoints();
      }
      this.loadingHttpApis = false;
    },
    handleNodeSelect(item) {
      let selectedRpc = this.$store.state.selectedRpc;
  
      selectedRpc[this.chainId] = item.endpoint;
      this.$store.dispatch('setSelectedRpc', selectedRpc)
      this.selectedHttpApi = selectedRpc = item.endpoint;;

      console.log(this.$store.getters.selectedRpc(this.chainId));

      //更新 url
      chain.get(this.chainId).updateHttpEndpoint(item.endpoint);
    },
  
    handleAddClick() {
      this.dialogVisible = true
    },
    handleDeleteClick(item){
      this.$confirm(this.$t('setting.confirmDelete'), this.$t('public.tip'), {
        confirmButtonText: this.$t('password.submit'),
        cancelButtonText: this.$t('password.cancel'),
        type: 'warning'
      }).then(() => {
        this.removeCustomEndpoint(item);
      }).catch(() => {});
    },
    async removeCustomEndpoint(item) {
      for (let index in this.customEndpoints) {
        let obj = this.customEndpoints[index]
        if (item.endpoint === obj.endpoint) {
          this.customEndpoints.splice(index, 1);
          break;
        }
      }
      //save
      const  customEndpoints = _.cloneDeep(this.customEndpoints);
      for (const api of customEndpoints) {
        delete api.delay;
      }

      let allCustomRpcs = this.$store.state.customRpcs;
      if (!allCustomRpcs) {
        allCustomRpcs = {};
      }
      allCustomRpcs[this.chainId] = customEndpoints;
      this.$store.dispatch('setCustomRpcs', allCustomRpcs)
    },
    async addCustomEndpoint() {
      let completeUrl = this.userEnterUrl
      for (let index in this.customEndpoints) {
        let obj = this.customEndpoints[index]
        if (completeUrl === obj.endpoint) {
          this.$message({
            showClose: true,
            offset: 70,
            message: 'Endpoint Exists',
            type: 'error'
          })
          return
        }
      }
      let isHttp = completeUrl.startsWith('http://')
      let isHttps = completeUrl.startsWith('https://')
      if (!isHttp && !isHttps) {
        this.$message({
          showClose: true,
          offset: 70,
          message: 'Endpoint must start with http:// or https://',
          type: 'error'
        })
        return
      }

      const startTimestamp = new Date().getTime();
      try {
        await chain.get().testHttpEndpoint(completeUrl)
      } catch(e) {
        this.$message({
          showClose: true,
          offset: 70,
          message: chain.getErrorMsg(e),
          type: 'error'
        })
        return
      }
      let endTimestamp = new Date().getTime()

      this.userEnterUrl = ''
      this.dialogVisible = false
      this.customEndpoints.push({
        endpoint: completeUrl,
        delay: (endTimestamp - startTimestamp) + 'ms'
      });
      

      //save
      const customEndpoints = _.cloneDeep(this.customEndpoints);
      for (const api of customEndpoints) {
        delete api.delay;
      }

      let allCustomRpcs = this.$store.state.customRpcs;
      if (!allCustomRpcs) {
        allCustomRpcs = {};
      }
      allCustomRpcs[this.chainId] = customEndpoints;
      this.$store.dispatch('setCustomRpcs', allCustomRpcs)

    },
    async pingRecommendEndpoints() {
      // E24054
      for (const item of this.recommendEndpoints) {
        var startTimestamp = new Date().getTime()
        try {
          await chain.get().testHttpEndpoint(item.endpoint);
          var endTimestamp = new Date().getTime()
          var timeInterval = endTimestamp - startTimestamp
          Vue.set(item, 'delay', timeInterval + 'ms')
        } catch(e) {
           Vue.set(item, 'delay', 'timeout')
        }
      }
    },
    async pingCustomEndpoints() {
      // E24054
      for (var item of this.customEndpoints) {
        var startTimestamp = new Date().getTime()
        try {
          await chain.get().testHttpEndpoint(item.endpoint);
          var endTimestamp = new Date().getTime()
          var timeInterval = endTimestamp - startTimestamp
          Vue.set(item, 'delay', timeInterval + 'ms')
        } catch(e) {
          Vue.set(item, 'delay', 'timeout')
          return
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
  height: calc(100% - 50px);
  overflow-x: hidden;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

/deep/ .el-input-group__prepend {
  padding: 0 8px;
}


.title {
  width: 100%;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  padding: 15px 0 10px 15px;
}

.title.custom {
  margin-top: 5px;
}

.default-rpcs {
  min-height: 100px;
  .center-text {
    height: 90px;
    color: #666;
  }
}


.setting-group {
  // border: 1px solid $separate-color;
  // border-width: 1px 0 1px 0;
  background-color: #fff;
  cursor: pointer;
  border-top: 1px solid $separate-color;
}

.setting-item {
  height: 60px;
  border-bottom: 1px solid $separate-color;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding-left: 15px;
  padding-right: 15px;

  // &:last-child {
  //   border-bottom-width: 0;
  // }

  .setting-title {
    white-space:nowrap;
    word-break: keep-all;
    text-overflow:ellipsis;
    overflow:hidden;
    width: 80%;
  }

  .setting-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    width: 20%;
    img {
      width: 7.5px;
      height: auto;
    }
  }

  .right-text {
    font-size: 12px;
    color: #cccccc;
    margin-right: 10px;
  }

  .right-icon {
    color: $primary-color;
    width: 22px;
    height: 44px;
    line-height: 44px;
    text-align: center;
  }
}


.custom-rpcs {
  .setting-title {
    width: calc(80% - 40px);
  }
  .setting-delete {
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.bottom-btn {
  position: fixed;
  height: 44px;
  left: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  line-height: 44px;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  background-color: $primary-color;
}

</style>


