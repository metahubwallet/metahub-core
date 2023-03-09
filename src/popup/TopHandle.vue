<template>
  <!--
左侧
props
    backText
中间
props
    title
    decline
或者
slot
<p
slot='center'>
    <span class="top-title__text _ellipsis" v-text='topModel.title'></span>
    <span class="top-title__num" v-text="'(320)'"></span>
    <span class="iconfont icon-mute" v-show='topModel.isMute'></span>
</p>

右侧
props
    nextPath
    nextIcon
或者
slot
    <div v-link="{path:'',append:true}">
        <span class="iconfont icon-chat-person"></span>
    </div>
  -->
  <div class="cover-top">
    <!-- left -->
    <div @click="back" class="top-back">
<!--      <img class="top-back-img" src="../assets/images/common_back@2x.png">-->
      <svg-icon icon-class="back"></svg-icon>
      <!-- <div @click="back" class="_ellipsis iconfont icon-return-arrow" >
      </div> -->
    </div>
    <!-- right -->
<!--    <div class="top-other">-->
<!--      <slot name="right">-->
<!--        <div class="_align-right" >-->
<!--          <span :class="nextIcon" class="iconfont"></span>-->
<!--        </div>-->
<!--      </slot>-->
<!--    </div>-->
    <!-- center -->
    <div class="top-title _effect" :class="{'_effect--50':decline, 'title-center': titles.length > 0}">
      <slot name="center" v-if="titles.length == 0"> {{ title }}</slot>
      <el-radio-group v-model="tabLabel" class="tabs" @change="onTabChange">
        <el-radio-button v-for="(tit, idx) in titles" :key="'tabk' + idx" :label="tit" :name="'tabn' + idx"></el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    //返回路径
    // 'backPath': {
    //     type: Object
    // },
    //返回文本
    backText: {
      type: String,
      default: '返回'
    },
    //衰退:cur是否变更为prev页
    decline: {
      default: false
    },
    //当前文本
    title: {
      type:String
    },
    titles: {
      type: Array,
      default() {
        return [];
      }
    },
    //右侧按钮下一页
    nextPath: {
      // type:Object
    },
    //右侧按钮class
    nextIcon: {
      type: String
    }
  },
  data() {
    return {
      tabLabel: ''
    }
  },
  mounted() {
    if (this.titles.length > 0) {
      this.tabLabel = this.titles[0];
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    onTabChange() {
    }
  }
}
</script>
<style lang="scss" scoped>

.top-back{
  min-width: 25px;
}

.top-back-img{
  width: 11px;
  height: 32px;
}

.title-center {
  align-items: center;
  justify-content: center;
}
</style>

