export const DOMAIN_URL = 'http://127.0.0.1:7001/';

/**
 * 生成指定区间的随机整数
 * @param min
 * @param max
 * @returns {number}
 */
export function randomNum(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 计算提示框的宽度
 * @param str
 * @returns {number}
 */
export function calculateWidth(arr: any) {
  return 30 + arr[0].length * 15
}

/**
 * 时间格式化
 */
export function dateFormat(fmt: string, date: Date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}