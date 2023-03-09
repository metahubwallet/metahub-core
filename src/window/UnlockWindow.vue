<template>
  <div class="window"></div>
</template>

<script>
export default {
  name: "UnlockWindow",
  components: {},
  data() {
    return {
    };
  },
  created() {
  },
  async mounted() {
    const windows = chrome.extension.getBackgroundPage().background.windows;
    windows.returnMessage('ok');
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/css/color.scss";
.window {
  width: 100%;
  height: 100%;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  overflow: hidden;
}
</style>
