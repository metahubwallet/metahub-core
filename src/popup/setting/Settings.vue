<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle
        :back-text="$t('auth.back')"
        :title="$t('setting.setting')"
      ></top-handle>
      <div class="cover-content _effect">
        <!-- 节点选择 -->
        <div class="setting-group">
          <div @click="handleNodeSelect" class="setting-item">
            <div class="setting-icon">
              <img class="img-icon" src="../../assets/images/setting_node_select@2x.png" />
            </div>
            <div class="setting-main">
              <div class="item-title">{{ $t("setting.nodesSetting") }}</div>
              <div class="item-subtitle"></div>
              <img class="img-icon" src="../../assets/images/right_arrow@2x.png" />
            </div>
          </div>
        </div>

        <div class="setting-group">



          <div @click="manageNetworkClicked" class="setting-item">
            <div class="setting-icon">
              <img class="img-icon" src="../../assets/images/setting_network_select@2x.png" />
            </div>
            <div class="setting-main">
              <div class="item-title">{{ $t("setting.manageNetworks") }}</div>
              <div class="item-subtitle"></div>
              <img class="img-icon" src="../../assets/images/right_arrow@2x.png" />
            </div>
          </div>
        </div>

        <div class="setting-group">
          <div @click="handleLanguageSelect" class="setting-item">
            <div class="setting-icon">
              <img class="img-icon" src="../../assets/images/setting_language@2x.png" />
            </div>
            <div class="setting-main">
              <div class="item-title">{{ $t("public.setLanguage") }}</div>
              <div class="item-subtitle">{{ $t("public.language") }}</div>
              <img class="img-icon" src="../../assets/images/right_arrow@2x.png" />
            </div>
          </div>
          <!-- 当前版本 -->
          <div class="setting-item">
            <div class="setting-icon">
              <img class="img-icon" src="../../assets/images/setting_refresh@2x.png" />
            </div>
            <div class="setting-main">
              <div class="item-title">{{ $t("setting.currentVersion") }}</div>
              <div class="item-subtitle">{{ currentVersion }}</div>
            </div>
          </div>
          <!-- 关于我们 -->
          <div @click="aboutUs" class="setting-item">
            <div class="setting-icon">
              <img class="img-icon" src="../../assets/images/setting_about_me@2x.png" />
            </div>
            <div class="setting-main">
              <div class="item-title">{{ $t("setting.aboutUs") }}</div>
              <div class="item-subtitle"></div>
              <img class="img-icon" src="../../assets/images/right_arrow@2x.png">
            </div>
          </div>
        </div>
      </div>
        <!--      <div class="setting-group">-->
        <!--        &lt;!&ndash; 锁定钱包 &ndash;&gt;-->
        <!--        <div @click="lockClicked" class="setting-item">-->
        <!--          <div class="setting-icon">-->
        <!--            <img-->
        <!--              class="img-icon"-->
        <!--              src="../../assets/images/setting_lock_wallet@2x.png"-->
        <!--            />-->
        <!--          </div>-->
        <!--          <div class="setting-main">-->
        <!--            <div class="item-title">{{ $t("setting.lockWallets") }}</div>-->
        <!--            <div class="item-subtitle"></div>-->
        <!--            &lt;!&ndash; <img class="img-icon" src="../../assets/images/right_arrow@2x.png"> &ndash;&gt;-->
        <!--          </div>-->
        <!--        </div>-->
        <!--      </div>-->
    </div>
  </div>
</template>

<script>
import TopHandle from "../TopHandle.vue";
import { mapActions } from "vuex";

export default {
  name: "Settings",
  components: { TopHandle },
  props: {
    msg: String
  },
  data() {
    return {
      currentVersion: "v1.0.0"
    };
  },
  created() {
    var manifestData = chrome.runtime.getManifest();
    this.currentVersion = manifestData.version;
  },
  methods: {
    ...mapActions(["setIsLock", "setPassword"]),
    handleNodeSelect() {
      this.$router.push({
        path: "/blockchains",
        query: {
          type: "node"
        }
      });
    },
    handleLanguageSelect() {
      this.$router.push("/language");
    },
    handleWhiteList() {
      this.$router.push({
        path: "/whitelist"
      });
    },
    manageWalletsClicked() {
      this.$router.push({
        path: "/wallets"
      });
    },
    manageNetworkClicked() {
      this.$router.push({
        path: "/network"
      });
    },
    lockClicked() {
      this.setPassword("");
      this.setIsLock(true);
    },
    aboutUs() {
      chrome.tabs.create({ url: "https://metahub.cash/" }); // 新标签页跳转
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "../../assets/css/color.scss";

/deep/ .el-scrollbar {
  width: 100%;
  height: 100%;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

.setting-group {
  padding: 0;
  // margin-top: 10px;
  background-color: #fff;
  // border-bottom: 1px solid $separate-color;


  .setting-item {
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    cursor: pointer;
    border-bottom: 1px solid $separate-color;

    // &:last-child .setting-main {
    //   border-bottom-width: 0;
    // }

    .setting-icon {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 50px;
      padding: 0 15px;
      img {
        width: auto;
        height: 18px;
      }
    }
    .setting-main {
      padding-right: 15px;
      display: flex;
      flex-grow: 1;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      // border-bottom: 1px solid $separate-color;
      img {
        width: 7.5px;
        height: auto;
      }
    }

    .item-title {
      margin-right: auto;
      margin-left: 2px;
      font-size: 16px;
      color: #222;
      justify-self: flex-start;
    }
    .item-subtitle {
      font-size: 13px;
      color: #888;
      margin-right: 10px;
    }
  }
}

/deep/ .el-dialog {
  width: 345px;
  max-height: 364px;
  overflow-y: hidden;
  overflow-x: hidden;
  border-radius: 6px;

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

  .el-input-group__append {
    background-color: #ffffff;
    border-width: 0 0 1px 0;
  }

  .el-table {
    width: 100%;
    .row-icon {
      display: none;
    }
    .green td:nth-child(2) {
      color: #6bcf44;
    }

    .yellow td:nth-child(2) {
      color: #d8eb2e;
    }
    .red td:nth-child(2) {
      color: #e70a0a;
    }

    .success-row .row-icon {
      color: #6bcf44;
      display: inline-block;
    }
  }

  .add-point-div {
    margin: 15px;
    display: flex;
    flex-direction: row;

    .el-button {
      margin-left: 12px;
    }
    input {
      border-radius: 0px;
      border-width: 0 0 1px 0;
    }
  }
}
</style>
