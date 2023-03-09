<template>
  <div class="app-all" id="app">
    <div class="bg" v-if="isInit && !isLock">
      <!-- 是否需要解锁钱包 -->
      <header class="app-header">
        <div :class="{ '_effect--50': decline }" class="_effect">
          <top-nav @change-account="handleChangeAccountClick"></top-nav>
        </div>
      </header>
      <section class="app-content">
        <!-- index router -->
        <transition :name="transitionName">
          <keep-alive include="WalletIndex">
            <router-view class="child-view"></router-view>
          </keep-alive>
        </transition>
      </section>

      <account-selector v-model="showAccountSelector"
          @account-click="handleAccountClick"
          @close-click="handleCloseClick"
          @import-click="handleImportClick"
      ></account-selector>
    </div>
    <div class="bg" v-else-if="isInit">
      <password-unlock></password-unlock>
    </div>
    <div class="bg" v-else>
      <password-setting></password-setting>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import TopNav from './TopNav.vue';
import AccountSelector from './components/AccountSelector';
import PasswordSetting from './PasswordSetting.vue';
import PasswordUnlock from './PasswordUnlock.vue';
import Windows from '../libraries/windows';

require('../assets/css/common.scss');
require('../assets/css/app.scss');

export default {
  name: 'app',
  components: {
    TopNav,
    AccountSelector,
    PasswordSetting,
    PasswordUnlock
  },
  data() {
    return {
      showAccountSelector: false,
      decline: false, //router animation
      transitionName: '',
    };
  },
  computed: {
    ...mapState(['passwordHash']),
    ...mapGetters(['isLock']),
    isInit() {
      return this.passwordHash != '';
    }
  },
  // watch $route 决定使用哪种过渡
  watch: {
    $route(to, from) {
      // this.decline = !this.decline;
      if (to.meta.index > from.meta.index) {
        this.transitionName = 'slide-left';
        if (from.meta.index == 1 && to.meta.index > 1) {
          this.decline = true;
        }
      } else if (to.meta.index < from.meta.index) {
        this.transitionName = 'slide-right';
        if (from.meta.index > 1 && to.meta.index == 1) {
          this.decline = false;
        }
      } else {
        this.transitionName = '';
      }
    }
  },
  events: {
    'route-pipe'(_decline) {
      this.decline = _decline;
    }
  },
  created() {
    // 检查一下窗口情况，还原图标
    if (Windows.getCount() == 0) {
      chrome.browserAction.setIcon({
        path: '../icons/metahub-128.png'
      });
    }
  },
  methods: {
    handleChangeAccountClick() {      this.showAccountSelector = true;
    },
    handleCloseClick() {      this.showAccountSelector = false;
    },
    handleAccountClick() {      this.showAccountSelector = false;
    },
    handleImportClick(chainId) {      this.$router.push({
        path: '/wallet/import',
        query: { chainId }
      });
      this.showAccountSelector = false;
    }
  }
};
</script>

<style lang='scss'>

body {
  height: 600px;
  width: 375px;
  font-family: PingFang SC;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
  font-family: PingFang SC;
}

body .el-message-box {
  width: 280px;
}

body .el-message {
  width: 96%;
}

.app-all {
  height: 100%;
}
</style>

<style lang='scss' scoped>
.bg {
  height: 100%;
  background-image: linear-gradient(
    rgba(246, 221, 255, 0.24),
    rgba(225, 225, 250, 0.04)
  );
}
.child-view {
  position: absolute;
  width: 100%;
  transition: all 0.2s;
}
.slide-left-enter,
.slide-right-leave-active {
  // opacity: 0;
  -webkit-transform: translate(100%, 0);
  transform: translate(100%, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  // opacity: 0;
  -webkit-transform: translate(-100%, 0);
  transform: translate(-100%, 0);
}

</style>
