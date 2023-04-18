function getTime () {
  const time = new Date()
  const Y = time.getFullYear()
  const M = time.getMonth() + 1
  const D = time.getDate()
  const h = time.getHours()
  const m = time.getMinutes()
  const s = time.getSeconds()

  const [YY] = [
    Y
  ].map(num => String(num))
  const [
    MM, DD, hh, mm, ss
  ] = [M, D, h, m, s].map(num => {
    return num < 10 ? '0' + String(num) : String(num)
  })

  return YY + MM + DD + hh + mm + ss
}

module.exports = {
  getTime
}
