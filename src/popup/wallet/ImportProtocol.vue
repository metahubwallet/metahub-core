<template>
  <div class="full-router">
    
    <div class="full-inner">
      <el-scrollbar class="full" >
      <top-handle :back-text="$t('auth.back')" :title="$t('public.readAndAgreeProtocols')"></top-handle>
      <div class="cover-content _effect">
        <div class="import-protocol">

          {{$t('public.viewUserProtocolsContent')}}
          
        </div>
      </div>
      </el-scrollbar>
    </div>
    <!-- router -->
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue'

export default {
  data() {
    return {}
  },
  components: {
    TopHandle
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/css/color.scss';

.import-protocol {
  
  background-color: white;
  font-size: 15px;
  margin: 15px;
  text-indent: 2em;
  color: #333333;
}
</style>


