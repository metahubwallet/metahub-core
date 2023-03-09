<template>
  <div class="full-router">
    <div class="full-inner">
      <top-handle :back-text="$t('auth.back')" :title="$t('setting.addCustomNetwork')"></top-handle>
      <div class="cover-content _effect">
        <el-scrollbar class="main-form">
          <el-form ref="form" :rules="rules" :model="network" label-position="top">
            <el-form-item :label="$t('setting.nodeName')" prop="name">
              <el-input :placeholder="$t('setting.nodeName')" v-model="network.name"></el-input>
            </el-form-item>
            <!-- <el-form-item :label="$t('setting.blockchainFoundation')">
              <el-select style="width:100%">
                <el-option label="EOS" value="eos"></el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="ChainId" prop="chainId">
              <el-input placeholder="ChainId" v-model="network.chainId"></el-input>
            </el-form-item>
            <el-form-item :label="$t('setting.defaultNode')" prop="endpoint">
              <el-input placeholder="https://" v-model="network.endpoint"></el-input>
            </el-form-item>
            <el-form-item :label="$t('setting.defaultSymbol')" prop="token">
              <el-input :placeholder="$t('setting.symbol')" v-model="network.token.symbol"></el-input>
              <el-checkbox :label="$t('setting.defineContractNameAndPrecision')" v-model="tokenDiy"></el-checkbox>
              <div v-show="tokenDiy">
                <el-col :span="14">
                  <el-input
                    :placeholder="$t('setting.contractName')"
                    v-model="network.token.contract"
                  ></el-input>
                </el-col>
                <el-col :span="2">&nbsp;</el-col>
                <el-col :span="8">
                  <el-input placeholder="$t('setting.precision')" v-model="network.token.precision"></el-input>
                </el-col>
              </div>
            </el-form-item>
          </el-form>
        </el-scrollbar>
        <div slot="footer" class="footer">
            <el-button type="primary" class="button" @click="submitAddNetwork">{{$t('password.submit')}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TopHandle from '../TopHandle.vue';
import { mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import { randomInt } from '../../util/utils';
import { eosChainId, supportNetworks } from '../../util/network';

export default {
  components: {
    TopHandle
  },
  data() {
    return {
      eosChainId,
      network: {
        name: '',
        chain: '',
        chainId: '',
        endpoint: '',
        token: {
          symbol: 'EOS',
          contract: 'eosio.token',
          precision: 4
        }
      },
      tokenDiy: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('setting.nameIsRequired'),
            trigger: 'blur'
          }
        ],
        chainId: [
          {
            required: true,
            message: this.$t('setting.chainIdIsRequire'),
            trigger: 'blur'
          },
          {
            min: 64,
            max: 64,
            message: this.$t('setting.lengthMustBe64Characters'),
            trigger: 'blur'
          }
        ],
        endpoint: [
          {
            required: true,
            type: 'url',
            message: this.$t('setting.defaultNodeFormatIsIncorrect'),
            trigger: 'blur'
          }
        ],
        token: [
          {
            validator: (rule, value, callback) => {
              if (value.symbol == '') {
                callback(new Error(this.$t('setting.defaultSymbolIsRequire')));
                return;
              }
              if (value.contract == '') {
                callback(new Error(this.$t('setting.contractNameRequired')));
                return;
              }
              const precision = parseFloat(value.precision);
              if (!Number.isInteger(precision)) {
                callback(
                  new Error(this.$t('setting.precisionMustBeAnInteger'))
                );
                return;
              }
              if (precision < 0 || precision > 8) {
                callback(new Error(this.$t('setting.precisionMustBeBetween')));
                return;
              }
              callback();
            },
            trigger: 'blur'
          }
        ]
      }
    };
  },
  computed: {
    ...mapState(['networks']),
    ...mapGetters(['findNetwork'])
  },
  mounted() {},
  methods: {
    submitAddNetwork() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }
        const  exists = supportNetworks.find(x => x.chainId == this.network.chainId);
        if (exists) {
          const network = _.clone(exists);
          this.addNetwork(network);
          this.$router.go(-1);
          return;
        }
        let old = this.networks.find(x => x.name == this.network.name);
        if (old) {
          this.$message({
            showClose: true,
            offset: 70,
            message: this.$t('setting.alreadyExistNetwork'),
            type: 'error'
          });
          return;
        }
        old = this.networks.find(x => x.chainId == this.network.chainId);
        if (old) {
          this.$message({
            showClose: true,
            offset: 70,
            message: this.$t('setting.alreadyExist'),
            type: 'error'
          });
          return;
        }
        const network = _.clone(this.network);
        network.chain = 'ch' + randomInt(10000, 99999); // or == chainid.substr(0, 7) ??

        // save
        this.addNetwork(network);
        this.$router.go(-1);
      });
    },

    addNetwork(network) {
      const networks = this.$store.state.networks;
      networks.push(network);
      this.$store.dispatch('setNetworks', networks);

      const selectedRpc = this.$store.state.selectedRpc;
      selectedRpc[network.chainId] = network.endpoint;
      this.$store.dispatch('setSelectedRpc', selectedRpc);

      const customRpcs = this.$store.state.customRpcs;
      customRpcs[network.chainId] = [
        {
          name: network.name,
          endpoint: network.endpoint
        }
      ];
      this.$store.dispatch('setCustomRpcs', customRpcs);
    },

    removeNetwork(network) {      const widx = this.$store.state.wallets.findIndex(
        x => x.chainId == network.chainId
      );
      if (widx >= 0) {
        this.$message({
          showClose: true,
          offset: 70,
          message: this.$t('setting.alreadyExistAccount'),
          type: 'error'
        });
        return;
      }
      const idx = this.networks.findIndex(
        x => x.chainId == network.chainId
      );
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
};
</script>
<style lang="scss" scoped>
@import "../../assets/css/color.scss";

.main-form {
  width: 100%;
  height: calc(100% - 60px);
  .el-form {
    padding: 10px 15px;
    .el-form-item {
      margin-bottom: 10px;
    }
    /deep/ .el-form-item__label {
      padding: 0;
    }
  }
}

.footer {
  display: flex;
  height: 60px;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  align-items: center;
}

/deep/ .el-input-group__prepend {
  padding: 0 8px;
}

.content {
  padding: 15px;
}

.button {
  border-radius: 10px;
  width: 90%;
  height: 40px;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
}

.bottom-btns {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  height: 44px;
  left: 0;
  right: 0;
  bottom: 10px;
  color: #fff;
  line-height: 44px;
  height: 44px;
  .btn {
    width: 42%;
    border-radius: 6px;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    background-color: $primary-color;
    cursor: pointer;
  }
}
.title {
  width: 100%;
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  padding: 10px 0 5px 15px;
}

.setting-group {
  border: 1px solid $separate-color;
  border-width: 1px 0 1px 0;
  background-color: #fff;
}

.setting-item {
  padding: 10px 0;
  border-bottom: 1px solid $separate-color;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  cursor: pointer;
  margin-left: 15px;
  padding-right: 15px;

  &:last-child {
    border-bottom-width: 0;
  }

  .setting-item-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    line-height: 28px;
  }
  .setting-item-remark {
    line-height: 24px;
    font-size: 12px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-titles {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .item-title {
    font-size: 14px;
    color: #333;
  }
  .item-subtitle {
    margin-left: 8px;
    font-size: 12px;
    color: #666;
  }
}
.row-icon {
  color: #6bcf44;
  width: 22px;
  height: 44px;
  line-height: 44px;
  text-align: center;
}

.networks {
  font-size: 12px;
}
</style>


