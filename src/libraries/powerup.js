const BigNumber = require('bignumber.js');

export function powerup(payer, receiver, cpu_amount='', net_amount='', powup_state = null) {
  // const powup_state = await eos_rpc.get_table_rows({
  //   code: 'eosio',
  //   scope: '',
  //   table: 'powup.state',
  //   json: true,
  //   limit: 1
  // });
  if (!powup_state) {
    powup_state = {
      "version": 0,
      "net": {
          "version": 0,
          "weight": "95454029146410",
          "weight_ratio": "10000000000000",
          "assumed_stake_weight": "964182112590",
          "initial_weight_ratio": "1000000000000000",
          "target_weight_ratio": "10000000000000",
          "initial_timestamp": "2021-02-24T03:31:31",
          "target_timestamp": "2021-04-08T08:08:08",
          "exponent": "2.00000000000000000",
          "decay_secs": 86400,
          "min_price": "2500.0000 EOS",
          "max_price": "75000.0000 EOS",
          "utilization": "61231951534",
          "adjusted_utilization": "76422565604",
          "utilization_timestamp": "2022-08-24T07:01:36"
      },
      "cpu": {
          "version": 0,
          "weight": "381816116585640",
          "weight_ratio": "10000000000000",
          "assumed_stake_weight": "3856728450360",
          "initial_weight_ratio": "1000000000000000",
          "target_weight_ratio": "10000000000000",
          "initial_timestamp": "2021-02-24T03:31:31",
          "target_timestamp": "2021-04-08T08:08:08",
          "exponent": "2.00000000000000000",
          "decay_secs": 86400,
          "min_price": "2500.0000 EOS",
          "max_price": "75000.0000 EOS",
          "utilization": "17169999664732",
          "adjusted_utilization": "21599474228273",
          "utilization_timestamp": "2022-08-24T07:01:36"
      },
      "powerup_days": 1,
      "min_powerup_fee": "0.0001 EOS"
    };
  }
  cpu_amount = parseAmount(cpu_amount);
  net_amount = parseAmount(net_amount);
  let cpu_frac=0, cpu_fee=0, net_frac=0, net_fee=0;
  if (cpu_amount) {
    let cpuParams = calc_cpu_params(cpu_amount, powup_state);
    cpu_frac = cpuParams.cpu_frac;
    cpu_fee = cpuParams.cpu_fee;
  }
  if (net_amount) {
    let netParams = calc_net_params(net_amount, powup_state);
    net_frac = netParams.net_frac;
    net_fee = netParams.net_fee;
  }
  // const { cpu_frac, cpu_fee } = calc_cpu_params(cpu_amount, powup_state);

  const parms = {
    payer,
    receiver,
    days: powup_state.powerup_days,
    net_frac: net_frac,
    cpu_frac: cpu_frac,
    max_payment: toBN(cpu_fee + net_fee).div(10000).toFixed(4) + ' EOS'
  };
  return parms;
}

function calc_cpu_params(cpu_amount, powup_state) {
  // const cpuAmount = 10000;  // 表示租用1EOS
  const rentbw_frac = Math.pow(10, 15);
  const cpu_weight = parseInt(powup_state.cpu.weight);
  const cpu_frac = toBN(cpu_amount).times(rentbw_frac).div(cpu_weight).toFixed(0);
  const utilization_increase = toBN(cpu_frac).times(cpu_weight).div(rentbw_frac).toFixed(0);
  const cpu_fee = calc_powerup_fee(powup_state.cpu, parseInt(utilization_increase));
  return { cpu_frac: parseInt(cpu_frac), cpu_fee }
}

function calc_net_params(net_amount, powup_state) {
  const rentbw_frac = Math.pow(10, 15);
  const net_weight = parseInt(powup_state.net.weight);
  const net_frac = toBN(net_amount).times(rentbw_frac).div(net_weight).toFixed(0);
  const utilization_increase = toBN(net_frac).times(net_weight).div(rentbw_frac).toFixed(0);
  const net_fee = calc_powerup_fee(powup_state.net, parseInt(utilization_increase));
  return { net_frac: parseInt(net_frac), net_fee }
}

function calc_powerup_fee(state, utilization_increase) {
  if (utilization_increase <= 0) {
    return 0;
  }
  let min_price = parseAmount(state.min_price);
  let max_price = parseAmount(state.max_price);
  const exponent = parseInt(state.exponent);
  const weight = parseInt(state.weight);

  // console.log(min_price.toString(), max_price.toString(), exponent.toString());
  const price_integral_delta = (start_utilization, end_utilization) => {
    const exponent = parseInt(state.exponent);
    const weight = parseInt(state.weight);
    let coefficient = (start_utilization - end_utilization) / exponent;
    let start_u = start_utilization / weight;
    let end_u = end_utilization / weight;
    const result = min_price * end_u - min_price * start_u +
               coefficient * Math.pow(end_u, exponent) - coefficient *  Math.pow(start_u, exponent);
    return result;
  };

  const price_function = utilization => {
    let price = min_price;
    let new_exponent = exponent - 1.0;
    if (new_exponent <= 0) {
      return max_price;
    } else {
      price += (max_price - min_price) * Math.pow(parseFloat(utilization) / weight, new_exponent);
    }
    return price;
  };

  let fee = 0.0;
  let start_utilization = parseInt(state.utilization);
  let end_utilization = start_utilization + utilization_increase;

  let adjusted_utilization = parseInt(state.adjusted_utilization);
  if (start_utilization < adjusted_utilization) {
    fee += price_function(adjusted_utilization) * Math.min(utilization_increase, adjusted_utilization - start_utilization) / weight;
    start_utilization = adjusted_utilization;
  }
  if (start_utilization < end_utilization) {
    fee += price_integral_delta(start_utilization, end_utilization);
  }
  return Math.ceil(fee);
}

function parseAmount(number) {
  return parseFloat(number.split(' ')[0].replace('.', ''));
}

function toBN(number) {
  return BigNumber(number);
}> 102200 );
// powerup('tester', '123555.0000 EOS');