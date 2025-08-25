/*
    作者: 无盐七
    仓库: https://github.com/imoki/
    B站：https://space.bilibili.com/3546828310055281
    QQ群：963592267
    公众号：默库
    
    脚本名称：services.js
    脚本兼容: airscript 1.0
    更新时间：20250425
    脚本：金山文档博客系统后端处理程序。解决金山文档跨域问题，文章发布功能。
    说明：将services.js脚本复制到金山文档Airscript脚本编辑器中，添加网络API。
          首次运行会自动生成表格，填写此表格，再运行即可发布文章。之后要更新文章，直接修改表格后，再运行services.js脚本即可更新成功。 
    “GITHUB TOKEN”获取方式：在 https://github.com/settings/tokens 选择 “Generate new token (classic) “生成token 
          */

// （需要修改的部分）
const OWNER = 'imoki';           // github 用户名，仓库所有者

// （以下不需要修改）
// ================================全局变量开始================================
const REPO = OWNER + '.github.io';     // github page 仓库名
const TYPE = "博客" // 系统类型，用于区分不同系统
const CONFIG = "[" + TYPE + "_配置]" // 配置标识
const ARTICLE = "[" + TYPE + "_文章]" // 文章标识
const ARTICLE_ABSTRACT_NUM = 20;    // 文章摘要字数，设置为 0 不显示摘要

// 配置 - 中间层配置处理
var MiddleLayerConfigConsistency = false; //  是否需要修改中间层，true为需要修改，否则为不修改
var MiddleLayerConfigMessage = {"name": "imoki", "avatar": "", "bio": "", "articleImages": {}}
// 配置
var sheetNameConfig = "配置"  // 配置表
// var contentConfig = [["Github Token","个人名称", "个人头像", "个人简介", "一致性校验（自动生成）"], ["", "imoki", "https://avatars.kkgithub.com/u/78804251?v=4", "热爱技术分享的开发者", ""]]; // 数据表内容
var contentConfig = [["Github Token","个人名称", "个人头像", "个人简介", "一致性校验（自动生成）"], ["", "imoki", "https://avatars.github.com/u/78804251?v=4", "热爱技术分享的开发者", ""]]; // 数据表内容

// 文章
var sheetNameArticle = "文章"; // 存储表名称
var contentArticle = [["标题", "内容" ,"封面（可不填）", "一致性校验（自动生成）" ,"发布状态（可不填，默认为发布）","类别（可不填）", "标签（可不填）"]]; // 数据表头

// 表中激活的区域的行数和列数
var row = 0;
var col = 0;
var maxRow = 100; // 规定最大行
var maxCol = 26; // 规定最大列
var workbook = [] // 存储已存在表数组
var colNum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
var version = 1 // 版本类型，自动识别并适配。默认为airscript 1.0，否则为2.0（Beta）
// ================================全局变量结束================================

// ======================生成表修改相关开始======================
// 延迟，单位秒
function sleep(d) {
  for (var t = Date.now(); Date.now() - t <= d; );
}

// 判断表格行列数，并记录目前已写入的表格行列数。目的是为了不覆盖原有数据，便于更新
function determineRowCol() {
  for (let i = 1; i < maxRow; i++) {
    let content = Application.Range("A" + i).Text
    if (content == "")  // 如果为空行，则提前结束读取
    {
      row = i - 1;  // 记录的是存在数据所在的行
      break;
    }
  }
  // 超过最大行了，认为row为0，从头开始
  let length = colNum.length
  for (let i = 1; i <= length; i++) {
    content = Application.Range(colNum[i - 1] + "1").Text
    if (content == "")  // 如果为空行，则提前结束读取
    {
      col = i - 1;  // 记录的是存在数据所在的行
      break;
    }
  }
  // 超过最大行了，认为col为0，从头开始
  // console.log("✨ 当前激活表已存在：" + row + "行，" + col + "列")
}

// 获取当前激活表的表的行列
function getRowCol() {
  let row = 0
  let col = 0
  for (let i = 1; i < maxRow; i++) {
    let content = Application.Range("A" + i).Text
    if (content == "")  // 如果为空行，则提前结束读取
    {
      row = i - 1;  // 记录的是存在数据所在的行
      break;
    }
  }
  // 超过最大行了，认为row为0，从头开始
  let length = colNum.length
  for (let i = 1; i <= length; i++) {
    content = Application.Range(colNum[i - 1] + "1").Text
    if (content == "")  // 如果为空行，则提前结束读取
    {
      col = i - 1;  // 记录的是存在数据所在的行
      break;
    }
  }
  // 超过最大行了，认为col为0，从头开始

  // console.log("✨ 当前激活表已存在：" + row + "行，" + col + "列")
  return [row, col]
}

// 激活工作表函数
function ActivateSheet(sheetName) {
  let flag = 0;
  try {
    let sheet = Application.Sheets.Item(sheetName)
    sheet.Activate()
    // console.log("🍾 激活工作表：" + sheet.Name)
    flag = 1;
  } catch {
    flag = 0;
    // console.log("📢 无法激活工作表，工作表可能不存在")
    // console.log("🪄 创建工作表：" + sheetName)
    createSheet(sheetName)
  }
  return flag;
}

// 统一编辑表函数
function editConfigSheet(content) {
  determineRowCol();
  let lengthRow = content.length
  let lengthCol = content[0].length
  if (row == 0) { // 如果行数为0，认为是空表,开始写表头
    for (let i = 0; i < lengthCol; i++) {
      if(version == 1){
        // airscipt 1.0
        Application.Range(colNum[i] + 1).Value = content[0][i]
      }else{
        // airscript 2.0(Beta)
        Application.Range(colNum[i] + 1).Value2 = content[0][i]
      }
      
    }

    row += 1; // 让行数加1，代表写入了表头。
  }

  // 从已写入的行的后一行开始逐行写入数据
  // 先写行
  for (let i = 1 + row; i <= lengthRow; i++) {  // 从未写入区域开始写
    for (let j = 0; j < lengthCol; j++) {
      if(version == 1){
        // airscipt 1.0
        Application.Range(colNum[j] + i).Value = content[i - 1][j]
      }else{
        // airscript 2.0(Beta)
        Application.Range(colNum[j] + i).Value2 = content[i - 1][j]
      }
    }
  }
  // 再写列
  for (let j = col; j < lengthCol; j++) {
    for (let i = 1; i <= lengthRow; i++) {  // 从未写入区域开始写
      if(version == 1){
        // airscipt 1.0
        Application.Range(colNum[j] + i).Value = content[i - 1][j]
      }else{
        // airscript 2.0(Beta)
        Application.Range(colNum[j] + i).Value2 = content[i - 1][j]
      }
    }
  }
}

// 存储已存在的表
function storeWorkbook() {
  // 工作簿（Workbook）中所有工作表（Sheet）的集合,下面两种写法是一样的
  let sheets = Application.ActiveWorkbook.Sheets
  sheets = Application.Sheets

  // 打印所有工作表的名称
  for (let i = 1; i <= sheets.Count; i++) {
    workbook[i - 1] = (sheets.Item(i).Name)
    // console.log(workbook[i-1])
  }
}

// 判断表是否已存在
function workbookComp(name) {
  let flag = 0;
  let length = workbook.length
  for (let i = 0; i < length; i++) {
    if (workbook[i] == name) {
      flag = 1;
      // console.log("✨ " + name + "表已存在")
      console.log("⚡️ 已检测到："+ name + "表")
      break
    }
  }
  return flag
}

// 创建表，若表已存在则不创建，直接写入数据
function createSheet(sheetname) {
  // const defaultName = Application.Sheets.DefaultNewSheetName
  // 工作表对象
  if (!workbookComp(sheetname)) {
    console.log("🪄 创建工作表：" + sheetname)
    try{
        Application.Sheets.Add(
        null,
        Application.ActiveSheet.Name,
        1,
        Application.Enum.XlSheetType.xlWorksheet,
        sheetname
      )
      
    }catch{
      // console.log("😶‍🌫️ 适配airscript 2.0版本")
      version = 2 // 设置版本为2.0
      let newSheet = Application.Sheets.Add(undefined, undefined, undefined, xlWorksheet)
      // let newSheet = Application.Worksheets.Add()
      newSheet.Name = sheetname
    }

  }
}

// airscript检测版本
function checkVesion(){
  try{
    let temp = Application.Range("A1").Text;
    Application.Range("A1").Value  = temp
    console.log("😶‍🌫️ 检测到当前airscript版本为1.0，进行1.0适配")
  }catch{
    console.log("😶‍🌫️ 检测到当前airscript版本为2.0，进行2.0适配")
    version = 2
  }
}
// ======================生成表修改相关结束======================


// ================================纯原生MD5开始===============================
let MD5 = function(e) {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function(a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function(b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};
// ================================纯原生MD5结束===============================


// ================================GITHUB处理函数开始================================
// 找到指定用户和标题的issue，传入参数username是所有者，target是标题，并返回COMMENT_ID
function getIssuesTarget(username, target) {
    url = `https://api.github.com/repos/${OWNER}/${REPO}/issues`;
    // console.log(url)
    headers = {
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    }
    resp = HTTP.fetch(url, {
        method: "get",
        headers: headers,
        // data: data
    });
    resp = resp.text()
    // Application.Range(colNum[0] + 20).Value = resp
    // console.log(resp)
    resp = JSON.parse(resp)
    // tasklist = []
    let title = ""
    let user = ""
    let body = ""
    let number = -1
    for(let i =0; i < resp.length; i++){
      title = resp[i]["title"]
      user = resp[i]["user"]["login"]
      // console.log("😶‍🌫️ 用户：", user, " 标题：",title)
      if (title == target && user == username) {
        console.log("🎯 找到目标" + target)
        body = resp[i]["body"]
        number = resp[i]["number"]
        // Application.Range(colNum[0] + 22).Value = body
        return number
        // break
      }
    }
    return -1
}

// 发布issue
function postIssues(title, content) {
  url = `https://api.github.com/repos/${OWNER}/${REPO}/issues`;
  // console.log(url)
  headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  }
  data = {
    // "owner": OWNER,
    // "repo": REPO,
    "title": title,
    "body": content,
    // "labels": ['bug'],
  };
  // console.log(data)
  resp = HTTP.post(
    url,
    data = data,
    { headers: headers }
  );
  resp = resp.json()
  // console.log(resp)
  sleep(5000)
}

// 删除issue - 真实删，存在问题
function deleteIssues(COMMENT_ID) {
  url = `https://api.github.com/repos/${OWNER}/${REPO}/issues/${COMMENT_ID}`;
  // console.log(url)
  headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  }
  // resp = HTTP.fetch(url, {
  //     method: "DELETE",
  //     headers: headers,
  //     // data: JSON.stringify(data)
  // });
  // resp = HTTP.fetch(url, {
  //   method: 'DELETE',
  //   // timeout: 2000,
  //   headers: headers
  // })
  resp = HTTP.delete(url, {
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    }
  })
  console.log(resp.status) // 200
  // console.log(resp.text())
  // {"message":"Not Found","documentation_url":"https://docs.github.com/rest","status":"404"}
  resp = resp.json()
  console.log(resp)
}

// 虚假删 - 只清空内容
function deleteIssuesFake(COMMENT_ID) {
  content = ""
  updateIssues(COMMENT_ID, content)
}

// 回复评论
function writeIssues(COMMENT_ID, content){
  url = `https://api.github.com/repos/${OWNER}/${REPO}/issues/${COMMENT_ID}/comments`
  
  // 设置请求头
  headers = {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  }

  // 构建请求体
  data = {
    'body': content
  }

  // 发送POST请求
  resp = HTTP.post(
    url,
    data = data,
    { headers: headers }
  );

  resp = resp.json()

  let replytime = resp["created_at"]
  // console.log(replytime)
  if(replytime != undefined){
    console.log("🚀 回复成功")
  }else{
    console.log("🚨 回复失败")
  }
  sleep(5000)
}

// 修改issue内容，根据COMMENT_ID修改
function updateIssues(COMMENT_ID, content){
  // url = `https://api.github.com/repos/${OWNER}/${REPO}/issues/${COMMENT_ID}/comments`  // 新增评论
  url = `https://api.github.com/repos/${OWNER}/${REPO}/issues/${COMMENT_ID}`; // 修改内容
  
  // 设置请求头
  headers = {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  }

  // 构建请求体
  data = {
    'body': content
  }

  // 发送POST请求
  resp = HTTP.post(
    url,
    data = data,
    { headers: headers }
  );

  resp = resp.json()
  let replytime = resp["created_at"]
  // console.log(replytime)
  if(replytime != undefined){
    console.log("🚀 更新成功")
  }else{
    console.log("🚨 更新失败")
  }
  sleep(5000)
}
// ================================GITHUB处理函数结束================================

// ================================业务逻辑开始================================

// ================================业务逻辑共用函数开始================================
// 时间戳生成，YYYY-MM-DD HH:mm:ss格式
function timestampCreate() {
  return new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].split('.')[0] // YYYY-MM-DD HH:mm:ss格式
}

// 格式化时间。2024-11-17 13:55:53 ->转化为：2024/7/23 10:01
function formatDate(dateStr) {
    // 假设dateStr是有效的日期字符串，格式为"YYYY-MM-DD HH:mm:ss"
    // 使用split方法将日期字符串拆分为年、月、日、时、分、秒
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');

    const formattedMonth = month.replace(/^0/, ''); // 删除月份的前导零（如果有）
    const formattedDay = day.replace(/^0/, ''); // 删除日期的前导零（如果有）

    // 使用数组元素构建新的日期字符串，时间只取到时
    const formattedDate = `${year}/${formattedMonth}/${formattedDay} ${hour}:${minute}`;

    return formattedDate;
}


// ================================业务逻辑共用函数结束================================

// ================================读取金山文档表格，对表格数据处理后，同步到中间层开始================================
// 检查是否具备操控github权限
function checkGithub() {
  ActivateSheet(sheetNameConfig)
  TOKEN = Application.Range("A2").Text  // 记录token
  if(TOKEN == "" || TOKEN == "undefined") {
    return false
  }
  return true
}

// 检查个人信息一致性校验值
function checkConsistency(sign){
  // console.log("🔒 生成一致性校验值")
  let md5 = ""
  // 计算md5
  md5 = MD5(sign)
  // console.log(md5)
  return md5
}

function formatToStr(str) {
  if (str == "undefined" || str == undefined ) {
    str = ""
  }
  return str
}

// 个人信息MD5|文章封面MD5
// 读取个人信息
function readPersonalInfo() {
  ActivateSheet(sheetNameConfig)
  pos = 2 // 第2行
  name = Application.Range("B" + pos).Text
  avatar = Application.Range("C" + pos).Text
  bio = Application.Range("D" + pos).Text
  consistency = Application.Range("E" + pos).Text  // 一致性校验
  consistencyArray = consistency.split('|');
  consistency = consistencyArray[0] // 第1个
  // console.log(consistency)

  MiddleLayerConfigMessage["name"] = name
  MiddleLayerConfigMessage["avatar"] = avatar
  MiddleLayerConfigMessage["bio"] = bio

  // 一致性校验检查
  let sign = String(name) + "|"  + String(avatar) + "|"  + String(bio)
  // 判断是否有被修改过
  // 一致性校验
  consistencyChallenge = checkConsistency(sign) // 新的一致性校验值
  if(consistencyChallenge == consistency){
    // console.log("✅ 个人信息一致性校验通过")
    console.log("⚡️ 已是最新个人信息，无需更新")
  }else{
    console.log("♻️ 获取最新个人信息")
    // 写入最新一致性校验
    consistency = consistencyChallenge + "|" + formatToStr(consistencyArray[1])
    // console.log(consistency)
    if(version == 1){
      // airscipt 1.0
      Application.Range("E" + pos).Value = consistency
    }else{
      // airscript 2.0(Beta)
      Application.Range("E" + pos).Value2 = consistency
    }

    // 需要写入最新配置到中间层
    MiddleLayerConfigConsistency = true;
  }
}

// 读取文章图片
function readArticleImage() {
  ActivateSheet(sheetNameConfig)
  let pos = 2
  consistency = Application.Range("E" + pos).Text  // 一致性校验
  consistencyArray = consistency.split('|');
  consistency = consistencyArray[1]   // 第2个
  // console.log(consistency)
  // 一致性校验 - 文章封面检查
  let sign = ""
  // 读取金山文档文章中每一行，写入配置中
  ActivateSheet(sheetNameArticle)
  let rowcol = getRowCol() 
  let workUsedRowEnd = rowcol[0]  // 行，已存在数据的最后一行
  // console.log(workUsedRowEnd)
  for(let row = 2; row <= workUsedRowEnd; row++) {
    title = Application.Range("A" + row).Text
    coverImage = formatToStr(Application.Range("C" + row).Text)
    // console.log(title, coverImage)
    MiddleLayerConfigMessage["articleImages"][ARTICLE + title] = coverImage
    sign += String(title) + "|" + String(coverImage) + "|"
  }
  
  // 判断是否有被修改过
  consistencyChallenge = checkConsistency(sign)
  if(consistencyChallenge == consistency){
    // console.log("✅ 文章封面一致性校验通过")
    console.log("⚡️ 已是最新文章封面，无需更新")
  }else{
    console.log("♻️ 获取最新文章封面")

    // 写入最新一致性校验
    consistency = formatToStr(consistencyArray[0]) + "|" + consistencyChallenge
    // console.log(consistency)
    ActivateSheet(sheetNameConfig)
    if(version == 1){
      // airscipt 1.0
      Application.Range("E" + pos).Value = consistency
    }else{
      // airscript 2.0(Beta)
      Application.Range("E" + pos).Value2 = consistency
    }

    // 需要写入最新配置到中间层
    MiddleLayerConfigConsistency = true;
  }
}

// 配置更新
function middleUpdateConfig() {
  // 个人信息处理
  readPersonalInfo()
  sleep(5000)
  // 文章封面处理
  readArticleImage()
  // console.log(MiddleLayerConfigMessage)
  if (MiddleLayerConfigConsistency) {
    // console.log("✨️ 开始更新中间层配置")
    // 需要更新配置
    target = CONFIG
    COMMENT_ID = getIssuesTarget(OWNER, target)
    if (COMMENT_ID != -1) {
      // 已存在，则更新
      console.log("✨ 更新中间层配置")
      // console.log(COMMENT_ID)
      content = JSON.stringify(MiddleLayerConfigMessage); // json转字符串
      updateIssues(COMMENT_ID, content)
    } else {
      console.log("🎉 添加中间层配置")
      // 不存在，则发布
      title = CONFIG
      content = JSON.stringify(MiddleLayerConfigMessage);
      postIssues(title, content)
    }
  }
}

// 文章发布
function middleUpdateArticle(){
  // 读取金山文档文章中每一行，写入配置中
  ActivateSheet(sheetNameArticle)
  let rowcol = getRowCol() 
  let workUsedRowEnd = rowcol[0]  // 行，已存在数据的最后一行
  // console.log(workUsedRowEnd)
  for(let row = 2; row <= workUsedRowEnd; row++) {
    title = Application.Range("A" + row).Text
    content = Application.Range("B" + row).Text
    coverImage = Application.Range("C" + row).Text
    publishStatus = Application.Range("E" + row).Text // 发布状态
    category = Application.Range("F" + row).Text
    tags = Application.Range("G" + row).Text
    // console.log(title)
    consistency = Application.Range("D" + row).Text  // 一致性校验
    // console.log(consistency)
    // 一致性校验 - 文章检查
    let sign = String(title) + "|" + String(content) + "|" + String(publishStatus) + "|" + String(category) + "|" + String(tags)
    // 判断是否有被修改过
    consistencyChallenge = checkConsistency(sign)
    if(consistencyChallenge == consistency){
      // console.log("✅ 文章一致性校验通过 - ", title)
      console.log("⚡️ 已是最新文章，无需更新，标题：", title)
      // 无需更新文章
    }else{
      // console.log("♻️ 更新最新文章：", title);
      // 写入最新一致性校验
      consistency = consistencyChallenge
      if(version == 1){
        // airscipt 1.0
        Application.Range("D" + row).Value = consistency
      }else{
        // airscript 2.0(Beta)
        Application.Range("D" + row).Value2 = consistency
      }

      title_article = ARTICLE + title
      // 查询是否有文章
      // 无对应文章，且发布状态为“发布”或空，则发文章
      if (publishStatus == "发布" ||  publishStatus == "" || publishStatus == "undefined" || publishStatus == undefined) {
        // console.log("🎉 发布文章：", title_article)
        // 查询是否有已存在的issue标题，有则直接修改文章内容，没有则创建
        COMMENT_ID = getIssuesTarget(OWNER, title_article)
        // console.log(COMMENT_ID)
        if (COMMENT_ID != -1) {
          console.log("🎉 更新文章：", title_article)
          // 存在issue，修改文章内容
          updateIssues(COMMENT_ID, content)
        } else {
          console.log("🎉 发布文章：", title_article)
          // 不存在issue，直接发布新issue
          postIssues(title_article, content)
        }
        
      } else if (publishStatus == "不发布") {
        console.log("🔥 删除文章：", title)
        // 发布状态为“不发布”，则删除文章
        COMMENT_ID = getIssuesTarget(OWNER, title)
        // console.log(COMMENT_ID)
        deleteIssuesFake(COMMENT_ID)
        
      }
    }
  }
}
function strTojson(note_content) {
    try {
        let jsonData = [];
        if (note_content) {
            // 改进点：仅过滤危险字符（保留emoji）
            const sanitized = note_content
                // .replace(/</g, '＜')  // 替换尖括号为全角符号
                // .replace(/>/g, '＞')
                // .replace(/\\/g, '＼') // 替换反斜杠为全角

            // 添加容错处理
            jsonData = JSON.parse(sanitized);
            
            // 类型校验
            if (!Array.isArray(jsonData)) {
                console.warn('数据格式异常，重置为数组');
                return [];
            }
        }
        return jsonData;
    } catch (error) {
        console.error('JSON解析失败，返回空数组:', error);
        return [];
    }
}

// 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”
function data_write_handle() {
  // 获取“仅写文件”密码
  key = getPassword("data_write", getKeyConfig())
  console.log("🔓️ 旧仅写密钥明文：", key)
  // console.log(key)
  // 读取“仅写文件”数据、清空文件数据
  message = []
  key_new = getPassword("data_write", globalKeyConfigNew)  // 新密码

  result = writeNecutData(NETCUT_DATA_WRITE, key.password, message, key_new.password)
  note_content = result[2]
  // console.log(note_content)
    
  // 将数据写入金山文档
  // json -> 表格每一行
  // 找到空行开始追行写入
  ActivateSheet(sheetNameArticle)
  let rowcol = getRowCol() 
  let workUsedRowEnd = rowcol[0]  // 行，已存在数据的最后一行
  note_content = strTojson(note_content)
  // console.log(workUsedRowEnd)
  // console.log(note_content.length)
  let count = 0
  for(let i = 0; i < note_content.length; i++) {
    row = workUsedRowEnd + 1 + count  // 从不存在数据的地方开始写入数据
    timestamp = note_content[i]["timestamp"]
    message = note_content[i]["message"]
    if (message == "") {
      // console.log("为空跳过")
      continue
    }
    count++;  // 往下一行走
    if(version == 1){
      // airscipt 1.0
      Application.Range(colNum[0] + row).Value = timestamp // 时间
      Application.Range(colNum[1] + row).Value = message // 漂流瓶内容
    }else{
      // airscript 2.0(Beta)
      Application.Range(colNum[0] + row).Value2 = timestamp // 时间
      Application.Range(colNum[1] + row).Value2 = message // 漂流瓶内容
    }
  }

}
// ================================读取金山文档表格，对表格数据处理后，同步到中间层结束================================

// ================================业务逻辑结束================================


// ================================初始化开始================================

// 表格初始化
function initTable(){
  checkVesion() // 版本检测，以进行不同版本的适配

  storeWorkbook()
  createSheet(sheetNameArticle)
  ActivateSheet(sheetNameArticle)
  editConfigSheet(contentArticle)

  createSheet(sheetNameConfig)
  ActivateSheet(sheetNameConfig)
  editConfigSheet(contentConfig)
}

// 后端初始化
function init() {
  // 权限检查
  if (!checkGithub()) { 
    console.log("✨ 请填写“配置”表中的GITHUB TOKEN等信息")
    console.log("✨ 然后填写“文章”中的内容")
    console.log("✨ 最后再次运行此脚本即可发布文章")
  } else {
    // 配置更新
    middleUpdateConfig()
    // 文章更新
    middleUpdateArticle()
  }


}

function main() {
  initTable();
  init()
}

main()

// ================================初始化结束================================