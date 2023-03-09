<template>
  <div class="window">
      <div class="header">
        <div
          class="title"
        >{{ type == 'transcation' ? $t('auth.executionContract') : $t('auth.requestSignature') }}</div>
        <div class="authorization">
          <div
              class="authorization-name"
          >{{ authorization ? authorization.actor + '@' + authorization.permission : '' }}</div>
          <div class="domain">{{ domain }}</div>
        </div>
      </div>

      <el-scrollbar class="content-transcation" v-if="type == 'transcation'">
        <div :key="index" class="content-action" v-for="(action, index) in actions">
          <div class="content-action-name">
            <div class="content-action-name-left">
              <span>{{ action.code }} → {{ action.type }}</span><span></span>
            </div>
            <div class="content-action-name-right">
              <div
                :class="{active:tabs[index]=='property'}"
                @click="onShowChange(index, 'property')"
                class="content-action-tab content-action-tab-property"
              >{{$t('auth.property')}}</div>
              <div
                :class="{active:tabs[index]=='json'}"
                @click="onShowChange(index, 'json')"
                class="content-action-tab content-action-tab-json"
              >JSON</div>
            </div>
          </div>

          <div class="content-action-data" v-if="tabs[index] == 'property'">
            <el-checkbox-group v-model="checkTypeGroup">
              <div
                :key="key"
                class="content-action-data-cell"
                v-for="(value, key) in action.data"
              >
                <div class="content-action-data-left">
                  <el-checkbox :label="key" v-if="checked"></el-checkbox>
                  <span v-if="!checked">{{ key }}</span>
                </div>
                <div class="content-action-data-right">{{ value }}</div>
              </div>
            </el-checkbox-group>
          </div>
          <div class="content-action-data content-action-json" v-if="tabs[index] == 'json'">
            <pre>{{actionsJson[index]}}</pre>
          </div>
        </div>
      </el-scrollbar>
      <div class="content-signature" v-if="type == 'signature'">
        <div class="content-signature-text">{{ encryptText }}</div>
      </div>

      <div class="whitelist" v-if="actions.length">
        <el-checkbox v-model="checked">{{$t('auth.joinWhitelist')}}</el-checkbox>
      </div>
      <div class="whitelist-tip" v-if="actions.length">{{$t('auth.whitelistTip')}}</div>
      <div class="trx-btns">
        <el-button @click="onClose" class="trx-btn">{{$t('auth.cancel')}}</el-button>
        <el-button :loading="loading" @click="onSubmit" class="trx-btn trx-btn2">{{$t('auth.submit')}}</el-button>
      </div>
  </div>
</template>

<script>
import Vue from 'vue'
import chain from '../libraries/chain'
import _ from 'lodash'
import { md5 } from '../util/crypto'
import { mapState, mapActions } from 'vuex'
import { eosChainId } from '../util/network'

export default {
  components: {},
  data() {
    return {
      checked: false,
      chainId: eosChainId,
      checkTypeGroup: [],
      type: 'transcation',
      tabs: [],
      authorization: {
        actor: '',
        permission: ''
      },
      domain: '',
      actions: [],
      actionsJson: [],
      encryptText: '',
      platform: process.platform,
      loading: false
    }
  },
  computed: {
    ...mapState(['language'])
  },

  watch: {
    checked(nv, ov) {
      if (nv) {
        // if (this.actions.length > 1) {        //   this.$message({
        //     showClose: true,
        //     offset: 70,
        //     message: this.$t('auth.canNotAdd'),
        //     type: 'warning'
        //   })
        //   this.checked = false
        // }
      }
    }
  },

  created() {
    this.windows = chrome.extension.getBackgroundPage().background.windows  },

  async mounted() {    //document.title = this.$t('auth.executionContract')

    this.payload = await this.windows.getParams()
    this.domain = this.payload.domain
    this.chainId = this.payload.chainId
    this.actions = this.payload.actions
    for (const act of this.actions) {
      this.tabs.push('property')
      this.actionsJson.push(JSON.stringify(act.data, null, '    '))
    }    if (this.actions.length == 1) {
        this.checkTypeGroup = []
        for (let key in this.actions[0].data) {
          this.checkTypeGroup.push(key)
        }
      }

    if (this.payload.encryptText) {
      this.type = 'signature'
      this.encryptText = this.payload.encryptText
    }
    this.authorization = this.payload.authorization
  },

  methods: {
    onSubmit() {
      this.loading = true
      let whitelists = []
      if (this.checked) {
        for (const action of this.actions) {
          let whitelist = {}
          const properties = _.cloneDeep(this.actions[0].data)
          this.checkTypeGroup.forEach(x => (properties[x] = '*'))
          whitelist.properties = properties
          whitelist.actor = this.authorization.actor
          whitelist.permission = this.authorization.permission
          whitelist.contract = action.code
          whitelist.action = action.type
          whitelist.chainId = this.chainId
          whitelist.domain = this.domain
          whitelist.hash = md5(
            [
              whitelist.domain,
              whitelist.chainId,
              whitelist.actor,
              whitelist.permission,
              whitelist.contract,
              whitelist.action
            ].join('-')
          )
          whitelists.push(whitelist)
        }
      }
      this.windows.returnMessage({
        whitelists: whitelists,
        signature: true
      })
    },

    onShowChange(index, tab) {
      //this.tabs[index] = tab;      //this.$set('tabs', index, tab);
      this.tabs.splice(index, 1, tab)
    },

    onClose() {
      this.windows.returnMessage(null, -1)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/css/color.scss';
/deep/ .el-scrollbar {
  height: 100%;
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}

/deep/ .el-checkbox-group {
  font-size: inherit;
  width: 100%;
  .el-checkbox {
    color: #4a4a4a;
    font-size: 12px;
  }
  .el-checkbox__label {
    font-size: 12px;
    font-weight: 600;
    padding-left: 6px;
    font-weight: 600;
  }
}

/deep/ .whitelist {
  .el-checkbox__label {
    padding-left: 6px;
  }
}

/deep/ .el-checkbox__input{
  .el-checkbox__inner{
    border-color: #C201F9;
  }
  &:hover{
    .el-checkbox__inner{
      border-color: #C201F9;
    }
  }
}
/deep/ .el-checkbox__input.is-checked{
  .el-checkbox__inner{
    background-color: #C201F9;
    border-color: #C201F9;
  }

}

.window {
  width: 100%;
  height: 100%;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  overflow: hidden;
  .header {
    font-size: 18px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 30px 20px 10px 20px;
    background-image: linear-gradient(
            rgba(246, 221, 255, 0.8),
            rgba(225, 225, 250, 0.05)
    );
    .title {
      flex-grow: 1;
      color: #222;
      font-size: 22px;
      line-height: 24px;
      font-weight: bold;
    }
    .authorization {
      margin-top: 25px;
      line-height: 21px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .authorization-name {
        font-size: 14px;
        color: #222;
      }
      .domain {
        color: #222;
        font-size: 14px;
      }
    }

  }

  .content-transcation {
    flex: 1;
    font-family: Helvetica, Arial;
    .content-action {
      padding: 0 20px;
      width: 100%;
      overflow: hidden;
      &:last-child {
        margin-bottom: 10px;
      }
      .content-action-name {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        color: #222;
        padding: 18px 0;
        .content-action-name-left {
          height: 30px;
          line-height: 30px;
          display: flex;
          flex-direction: row;
          align-items: center;
          span {
            height: 30px;
            display: block;
            padding: 0 5px 0 14px;
            background-image: url("../assets/images/trx-action1.png");
            background-size: auto 30px;
          }
          span:last-child {
            padding: 0;
            width: 9px;
            height: 30px;
            background-image: url("../assets/images/trx-action2.png");
            background-size: 9px 30px;
          }
        }
        .content-action-name-right {
          width: 150px;
          height: 26px;
          font-size: 12px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
          background: #F8F8F8;
          border-radius: 14px;
          .content-action-tab {
            width: 75px;
            height: 100%;
            text-align: center;
            line-height: 26px;
            color: $primary-color;
            cursor: pointer;
            font-weight: 500;
          }
          .content-action-tab.active {
            background: linear-gradient(140deg, #DA00F2 0%, #BF01FA 100%, #BF01FA 100%);
            color: white;
            border-radius: 14px;
          }
        }
      }

      .content-action-data {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        background: #FCFCFC;
        box-shadow: 0px 1px 4px 0px rgba(108,10,88,0.06);
        border-radius: 12px;
        border: 1px solid #d2d2d2;
        padding: 15px;
        font-size: 12px;
        overflow: hidden auto;

        &.content-action-json {
          padding: 10px 15px;
          overflow: hidden;
          color: #666;
          pre {
            font-family: Consolas, Mono, Menlo, Helvetica, Arial;
            display: block;
            width: 100%;
            font-size: 12px;
            word-break: break-all;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }

        .content-action-data-cell {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          margin-bottom: 10px;
          &:last-child {
            margin-bottom: 0;
          }
          .content-action-data-left {
            min-width: 75px;
            color: #222;
            font-weight: bold;
          }
          .content-action-data-right {
            width: 100px;
            padding-left: 20px;
            flex-grow: 1;
            color: #222;
            word-break: break-all;
          }
        }
      }
    }
  }

  .content-signature {
    flex: 1;
    padding: 20px 20px 10px 20px;
    width: 100%;
    overflow: hidden;
    .content-signature-text {
      background: #f2f2f2;
      border-radius: 4px;
      padding: 20px;
    }
  }

  .whitelist {
    padding: 0 20px;
    height: 34px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    color: #4a4a4a;
    font-weight: 400;
  }
  .whitelist-tip {
    padding: 0 20px;
    font-size: 12px;
    line-height: 20px;
    color: #888;
    word-wrap: break-word;
    text-align: left;
  }
  .trx-btns {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 90px;
    .trx-btn {
      border: 1px solid $primary-color;
      border-radius: 4px;
      box-shadow: 0px 1px 4px 0px rgba(210,0,244,0.09);
      border-radius: 33px;
      font-weight: 500;
      width: 116px;
      font-size: 14px;
      color: $primary-color;
    }
    .trx-btn2 {
      background: linear-gradient(140deg, #DA00F2 0%, #BF01FA 100%, #BF01FA 100%);
      box-shadow: 0px 1px 4px 0px rgba(210,0,244,0.09);
      border-radius: 33px;
      color: #fff;
      margin-left: 20px;
    }
  }
}
</style>

