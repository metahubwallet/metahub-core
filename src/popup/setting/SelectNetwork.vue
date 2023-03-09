<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('setting.blockchainFoundation')"></top-handle>
      <div class="cover-content _effect">
        <div class="change-node">
          <!-- 节点选择 -->

          <div class="setting-group">
            <div
              :key="item.chainId"
              @click="handleNodeSelect(item.chainId)"
              class="setting-item"
              v-for="item in networks"
            >
              <div class="setting-item-left">
                <div class="item-title">{{item.name}}</div>
              </div>
              <div class="setting-item-right">
                <div class="item-subtitle"> {{currentHttpEnd(item.chainId)}}</div>
                <img class="bg-img" src="../../assets/images/right_arrow@2x.png">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- router -->
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      type: this.$route.query.type
    }
  },
  components: {
    TopHandle
  },
  computed: {
    ...mapState(['networks']),
    
  },

  methods: {
    handleNodeSelect(chainId) {
      if (this.type === 'node') {
        this.$router.push({
          path: '/node/manager',
          query: { chainId }
        })
      } else {
        this.$router.push({
          path: '/account/manager',
          query: { chainId }
        })
      }
    },
    currentHttpEnd(chainId) {
      return this.$store.getters.selectedRpc(chainId);
    }
  },
  mounted() {  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/color.scss';


.setting-group {
  padding: 0;
  // margin-top: 10px;
  background-color: #fff;
  // border: 1px solid $separate-color;
  // border-width: 1px 0 1px 0;
  // &:first-child {
  //   margin-top: 15px;
  // }
  .setting-item {
    height: 60px;
    border-bottom: 1px solid $separate-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding-left: 15px;
    padding-right: 15px;
    // &:last-child {
    //   border-bottom-width: 0;
    // }

    .setting-item-left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        width: 30px;
        height: auto;
        margin-right: 15px;
      }
    }
    .setting-item-right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      img {
        width: 7.5px;
        height: auto;
      }
    }

    .item-title {
      font-size: 16px;
      color: #000;
      padding-left: 10px;
    }
    .item-subtitle {
      font-size: 12px;
      color: #cccccc;
      margin-right: 10px;
    }
  }
}
</style>


