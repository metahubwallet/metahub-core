import moment from 'moment';
// import Decimal from 'decimal.js';
import BN from 'bn.js';
import BigNumber from 'bignumber.js';

export function getStorage(key, defaultValue = '') {
  return new Promise(resolve => {
    chrome.storage.local.get(key, items => {
      if (Array.isArray(key)) {
        resolve(items);
        return;
      }
      let value = typeof items[key] != 'undefined' ? items[key] : defaultValue;
      if (
        typeof value == 'string' &&
        (value.startsWith('[') || value.startsWith('{'))
      ) {
        value = JSON.parse(value);
      }
      resolve(value);
    });
  });
}

export function setStorage(key, value = '') {
  return new Promise(resolve => {
    if (!key) {
      resolve();
      return;
    }
    let data = {};
    if (typeof key == 'object') {
      data = key;
    } else if (typeof key == 'string') {
      if (typeof value != 'undefined' && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      data[key] = value;
    } else {
      resolve();
      return;
    }
    chrome.storage.local.set(data, () => resolve());
  });
}

export function getBackground() {
  return chrome.extension.getBackgroundPage().background;
}

export async function getCachedABI(chainId, contract) {
  const cachedAbis = await getStorage('cachedAbis', []);
  const cachedAbi = cachedAbis.find(
    x => x.chainId == chainId && x.contract == contract
  );
  return cachedAbi ? cachedAbi : '';
}

export async function setCacheABI(abi) {
  const cachedAbis = await getStorage('cachedAbis', []);
  const index = cachedAbis.findIndex(
    x => x.chainId == abi.chainId && x.contract == abi.contract
  );
  if (index >= 0) {
    cachedAbis[index] = abi;
  } else {
    cachedAbis.push(abi);
  }
  setStorage('cachedAbis', cachedAbis);
}

export async function clearCacheABI() {
  setStorage('cachedAbis', []);
}

export function timeUtcFormat(utcDate) {
  return moment(new Date(moment.utc(utcDate))).format('YYYY/MM/DD HH:mm:ss');
}

export function formatNumber(num) {
    if (isNaN(num)) {
        return 0;
    }
    let length = ('' + num).split('.').length;
    let long = 0;
    if (length > 1) {
        long = ('' + num).split('.')[1].length;
    }
    return Number(num).toLocaleString('en', { minimumFractionDigits: long });
}
// 科学计数法转数值 - 处理 1e-7 这类精度问题
export function getFullNum(num) {
    // 处理非数字
    if (isNaN(num)) {
        return num;
    }
    // 处理不需要转换的数字
    const str = String(num);
    if (!/e/i.test(str)) {
        return num;
    }
    return Number(num)
        .toFixed(18)
        .replace(/\.?0+$/, '');
}
// 返回小数位后几位 截取
// number 数值
// p 位数
export function toFixed(number, pp) {
    let num = isNaN(number) || !number ? 0 : number
    let p = isNaN(pp) || !pp ? 0 : pp
    num = getFullNum(num)
    var n = (num + '').split('.') // eslint-disable-line
    var x = n.length > 1 ? n[1] : '' // eslint-disable-line
    if (x.length > p) {
        // eslint-disable-line
        x = x.substr(0, p) // eslint-disable-line
    } else {
        // eslint-disable-line
        x += Array(p - x.length + 1).join('0') // eslint-disable-line
    } // eslint-disable-line
    return n[0] + (x == '' ? '' : '.' + x) // eslint-disable-line
}

export function bn(number, base=10) {
  let num = isNaN(parseInt(number)) ? 0 : number;
  return new BN(num + '', base);
}

export function bignum(number, base=10) {
  let num = isNaN(parseFloat(number)) ? 0 : number;
  return new BigNumber(num, base);
}


export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function briefAccount(account, prefixLength = 6, subfixLength = 5) {
  if (account.length <= 12) {
    return account;
  }
  return account.substr(0, prefixLength) + '...' + account.substr(subfixLength * -1, subfixLength);
}