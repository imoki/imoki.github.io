/*
    作者: 无盐七
    仓库: https://github.com/imoki/
    B站：https://space.bilibili.com/3546828310055281
    QQ群：963592267
    公众号：默库
    
    脚本名称：services.js
    脚本兼容: airsript 1.0、airscript 2.0
    更新时间：20250418
    脚本：金山文档漂流瓶后端处理程序。具备自动密钥分配，自动数据处理等功能，密钥以密文形式存储于金山文档中。
    说明：此脚本运行在金山云文档中，将其加入到定时任务中，每隔指定时间即可更新漂流瓶数据。
*/

// （需要修改的部分） 
// 读密钥文件 - 仅读（只读链接） - 带密码（KEY_READ_KEY，默认：imoki），源链接：https://netcut.cn/imoki_key_read
const NETCUT_KEY_READ = "https://netcut.cn/p/198ff0887be153df"  
// 读数据文件 - 仅读（只读链接） - 带密码（DATA_READ_KEY，默认：imoki），源链接：https://netcut.cn/imoki_data_read
const NETCUT_DATA_READ = "https://netcut.cn/p/d270347e14a3ad28"
// 写数据文件 - 写（剪贴板链接） - 带密码（DATA_WRITE_KEY，默认：imoki），源链接：https://netcut.cn/imoki_data_write
const NETCUT_DATA_WRITE = "https://netcut.cn/imoki_data_write"

// （可变可不变）
// 前端内置密钥 - 前后端密码一致
const FRONT_KEY = "imoki"    // 默认
// 读密钥文件的密钥 - “密钥文件”的密码
const KEY_READ_KEY = "imoki";   // 默认
// 最终密钥 = 解密算法（后端密钥+前端密钥）
// DATA_READ_KEY和DATA_WRITE_KEY是动态变化的，需要用解密算法获得最终密钥

// ================================全局变量开始================================
// imoki -> BMSA加密 -> <'XB<[-
var contentConfig = [["密钥文件密码", "仅读文件密码", "仅读文件加密算法",  "仅写文件密码", "仅写文件加密算法"],["imoki", "<'XB<[-", "BMAS", "<'XB<[-", "BMAS"]]; // 数据表内容
var contentData = [["时间", "漂流瓶内容"]]; // 数据表头
var sheetNameConfig = "CONFIG"  // 配置表
var sheetNameData = "DATA"; // 存储表名称
// 表中激活的区域的行数和列数
var row = 0;
var col = 0;
var maxRow = 100; // 规定最大行
var maxCol = 26; // 规定最大列
var workbook = [] // 存储已存在表数组
var colNum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

let globalKeyConfig = null; // 存密钥，旧密码
let globalKeyConfigNew = null;  // 存密钥，新密码
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
      console.log("✨ " + name + "表已存在")
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


// ================================BMAS加解密算法开始================================
// 加密和解密后为可打印字符

// 自定义的四层加密保护 - BMAS
// B(Base64) + M(Matrix) + A(ASCII) + S(Scramble)
// 四层加密保护：（Base64编码 + 动态替换矩阵 + ASCII位移 + 随机字符扰动）
// 第一层：Base64编码
// 第二层：动态替换矩阵（基于密钥生成）
// 第三层：ASCII位移（位移量由密钥计算）
// 第四层：随机字符扰动

// 安全Base64编码（兼容URL）
function safeBase64Encode(bytes) {
    const standard = btoa(String.fromCharCode(...bytes));
    return standard.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 安全Base64解码
function safeBase64Decode(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') 
        + '==='.slice(0, (4 - (str.length % 4)) % 4);
    return new Uint8Array([...atob(padded)].map(c => c.charCodeAt(0)));
}

// 矩阵替换层
function createCipherMatrix(key) {
    const STANDARD_BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const seed = Array.from(key).reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const chars = STANDARD_BASE64.split('');
    const shuffled = [...chars];
    
    // 确定性洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(fastPRNG(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return new Map(chars.map((char, i) => [char, shuffled[i]]));
}

// 伪随机生成（替代sin-based算法）
function fastPRNG(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

// 位移运算
const PRINTABLE_MIN = 32; // 空格
const PRINTABLE_MAX = 126; // ~
const PRINTABLE_RANGE = PRINTABLE_MAX - PRINTABLE_MIN + 1;

function computeShiftValue(key) {
    // 确保位移量在1-93之间（可打印字符范围）
    return Array.from(key).reduce((sum, c) => sum + c.charCodeAt(0), 0) % 93 + 1;
}

function applyShift(bytes, shift) {
    return bytes.map(b => {
        const normalized = b - PRINTABLE_MIN;
        const shifted = (normalized + shift) % PRINTABLE_RANGE;
        return PRINTABLE_MIN + (shifted < 0 ? shifted + PRINTABLE_RANGE : shifted);
    });
}

function reverseShift(bytes, shift) {
    return bytes.map(b => {
        const normalized = b - PRINTABLE_MIN;
        const unshifted = (normalized - shift) % PRINTABLE_RANGE;
        return PRINTABLE_MIN + (unshifted < 0 ? unshifted + PRINTABLE_RANGE : unshifted);
    });
}

// UTF-8编码实现 - 文本字符串转换为字节数组
function textToBytes(text) {
    let bytes = [];
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        
        // 处理4字节字符（代理对）
        if (0xD800 <= code && code <= 0xDBFF) {
            let nextCode = text.charCodeAt(i + 1);
            if (0xDC00 <= nextCode && nextCode <= 0xDFFF) {
                code = (code - 0xD800) * 0x400 + nextCode - 0xDC00 + 0x10000;
                i++;
            }
        }

        // 转换为UTF-8字节
        if (code <= 0x7F) {
            bytes.push(code);
        } else if (code <= 0x7FF) {
            bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
        } else if (code <= 0xFFFF) {
            bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
        } else {
            bytes.push(
                0xF0 | (code >> 18),
                0x80 | ((code >> 12) & 0x3F),
                0x80 | ((code >> 6) & 0x3F),
                0x80 | (code & 0x3F)
            );
        }
    }
    return new Uint8Array(bytes);
}

// UTF-8解码实现 - 字节数组转换为文本字符串
function bytesToText(bytes) {
    let str = '';
    let i = 0;
    while (i < bytes.length) {
        let byte1 = bytes[i++];
        
        // 1字节字符
        if ((byte1 & 0x80) === 0) {
            str += String.fromCharCode(byte1);
        } 
        // 2字节字符
        else if ((byte1 & 0xE0) === 0xC0) {
            let byte2 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
        }
        // 3字节字符
        else if ((byte1 & 0xF0) === 0xE0) {
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            let code = ((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F);
            str += String.fromCharCode(code);
        }
        // 4字节字符（代理对）
        else {
            let byte2 = bytes[i++];
            let byte3 = bytes[i++];
            let byte4 = bytes[i++];
            let code = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) 
                    | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
            
            // 转换为代理对
            code -= 0x10000;
            str += String.fromCharCode(
                0xD800 + (code >> 10),
                0xDC00 + (code & 0x3FF)
            );
        }
    }
    return str;
}

// 加密 - BMAS
function encrypt_BMAS(plainText, key) {
    try {
        // 第一层：Base64编码
        const textBytes = textToBytes(plainText);
        const base64Str = safeBase64Encode(textBytes);

        // 第二层：矩阵替换
        const matrix = createCipherMatrix(key);
        const matrixStr = [...base64Str].map(c => matrix.get(c) || c).join('');

        // 第三层：位移运算
        const shift = computeShiftValue(key);
        const shiftedBytes = applyShift(
            new Uint8Array([...matrixStr].map(c => c.charCodeAt(0))),
            shift
        );

        // 第四层：转换为可打印字符
        return Array.from(shiftedBytes)
            .map(b => String.fromCharCode(b))
            .join('');
    } catch (error) {
        console.error('加密失败:', error);
        throw new Error('加密过程异常');
    }
}

// 解密 - BMAS
function decrypt_BMAS(cipherText, key) {
    try {
        // 第四层逆：转换字节数组
        const cipherBytes = new Uint8Array(
            [...cipherText].map(c => c.charCodeAt(0))
        );

        // 第三层逆：位移还原
        const shift = computeShiftValue(key);
        const unshiftedBytes = reverseShift(cipherBytes, shift);

        // 第二层逆：矩阵还原
        const matrix = createCipherMatrix(key);
        const reverseMap = new Map([...matrix].map(([k, v]) => [v, k]));
        const base64Str = String.fromCharCode(...unshiftedBytes)
            .split('')
            .map(c => reverseMap.get(c) || c)
            .join('');

        // 第一层逆：Base64解码
        return bytesToText(safeBase64Decode(base64Str));
    } catch (error) {
        console.error('解密失败:', error);
        throw new Error('解密过程异常');
    }
}
// ================================自定义BMAS加解密算法结束================================


// ================================业务逻辑开始================================

// 文件说明：
// “仅读文件” - 临时漂流瓶集
// “仅写文件” - 扔漂流瓶集
// “密钥文件” - “仅读文件”、“仅写文件”的密文密码
// “读密码” - “仅读文件”的明文密码
// “写密码” - “仅写文件”的明文密码
// 金山文档密钥数据 - “读密码”、“写密码”的密文密码
// 金山文档用户数据 - 数据库漂流瓶集

// 前端处理流程：
// 1. 密钥获取、解密、缓存 - 安全处理
// 2. 通过“读密码”读取“仅读文件”数据 - 拿漂流瓶
// 3. 通过“写密码”写入“仅写文件”数据 - 扔漂流瓶

// 后端处理流程：
// 1. 密钥生成、加密、存储、修改 - 安全处理
// 2. 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”，修改密码 - 更新数据库漂流瓶集
// 3. 根据金山文档数据选择漂流瓶更新“仅读文件”，修改密码 - 更新临时漂流瓶集

// ================================业务逻辑共用函数开始================================
// 时间戳生成，YYYY-MM-DD HH:mm:ss格式
function timestampCreate() {
  return new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].split('.')[0] // YYYY-MM-DD HH:mm:ss格式
}

// 读内容 - netcut.cn
async function getNetcutData(url, note_pwd){
    result = ""
    // https://netcut.cn
    note_id = get_note_id(url)
    url = "https://api.txttool.cn/netcut/note/info/"

    // // 使用URLSearchParams处理表单数据
    // const formData = new URLSearchParams();
    // formData.append('note_id', note_id);    // id
    // formData.append('note_pwd', note_pwd);  // 密码

    // 金山文档特殊化处理
    headers = {
      "Content-Type": "application/x-www-form-urlencoded", 
    }

    data = {
      'note_id' : note_id,
      'note_pwd': note_pwd
    }
    
    resp = HTTP.post(
      url,
      data = data,
      { headers: headers }
    );

    resp = resp.json();

    console.log(resp)
    status = resp["status"]
    if(status == 1){
        // console.log("✅ 数据获取成功")
        note_content = resp["data"]["note_content"]
        result = note_content

    }else{
        console.log("❌ 数据获取失败")
    }
    
    // 添加JSON解析
    result = JSON.parse(result);
    
    return result
}

// 识别传入的url是只读链接还是剪贴板链接
function checkNetcutUrlType(url) {
    // 特征检测：是否包含 /p/ 路径段
    // 基础特征判断
    const isPFormat = url.includes('/p/');
    return isPFormat
}

// 写内容 - 覆盖 - netcut.cn
function writeNecutData(url, note_pwd, note_content, note_pwd_new){
    let result = []
    // https://netcut.cn
    // console.log(url)
    note = getNetcutInfo(url, note_pwd)
    // console.log(note)
    note_id = note["note_id"]
    note_name = note["note_name"]
    note_token = note["note_token"]
    note_content = JSON.stringify(note_content, null, 2); // 带格式的JSON
    url = "https://api.txttool.cn/netcut/note/save/"
    // 金山文档特殊化处理
    headers = {
      "Content-Type": "application/x-www-form-urlencoded", 
    }

    if(note_pwd_new) {
      note_pwd = note_pwd_new
    }
    // console.log("✅ 最新密码：" + note_pwd)

    if(!note_name) {
      // console.log("note_name 为空")
      data = {
        // 'note_name': note_name,
        'note_id' : note_id,
        'note_content': note_content,
        'note_token': note_token,
        'note_pwd': note_pwd,
        'expire_time': 94608000,
      }
    } else {
      data = {
        'note_name': note_name,
        'note_id' : note_id,
        'note_content': note_content,
        'note_token': note_token,
        'note_pwd': note_pwd,
        'expire_time': 94608000,
      }
    }
    
    // console.log(data)
    
    resp = HTTP.post(
      url,
      data = data,
      { headers: headers }
    );

    resp = resp.json();
    // console.log(resp)
    status = resp["status"]
    if(status == 1){
      console.log("✨ 更新数据成功")
      updated_time = resp["data"]["time"] // 更新时间
      result[0] = status
      result[1] = formatDate(updated_time)  // 2024-07-20 21:33:22 -> 2024/7/23 10:00
      result[2] = note["note_content"]
      // console.log(result)
    }else{
      result[0] = status
    }

    return result
}

// 获取信息，含id、token
function getNetcutInfo(url, note_pwd){
    if(checkNetcutUrlType(url)) {
      // 只读链接
      data = {
        'note_id': get_note_id(url),
        'note_pwd': note_pwd,
      }
    } else {
      // 剪贴板链接
      data = {
        'note_name': get_note_id(url),
        'note_pwd': note_pwd,
      }
    }
    // console.log(data)
    // console.log("✨ 获取token")
    url = "https://api.txttool.cn/netcut/note/info/"

    // 金山文档特殊化处理
    headers = {
      "Content-Type": "application/x-www-form-urlencoded", 
    }
    
    resp = HTTP.post(
      url,
      data = data,
      { headers: headers }
    );
    
    resp = resp.json()
    // console.log(resp);
    note_id = resp["data"]["note_id"]
    note_name = resp["data"]["note_name"]  
    note_token = resp["data"]["note_token"] 
    note_content = resp["data"]["note_content"]
    note = {
        "note_name": note_name,
        "note_id" : note_id, 
        "note_token" : note_token,
        "note_content" : note_content,
    }
    // console.log(note)
    return note
}

// 从url获取noteid
function get_note_id(url){
    note_id = url.split("/")
    note_id = note_id[note_id.length - 1]
    return note_id
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


// ================================1. 密钥生成、加密、存储开始================================
// 解密函数统一入口
function decrypt(algorithm, encryptedStr) {
    // 输入：算法、后端密钥
    // 输出：最终密钥
    switch (algorithm) {
        case 'BMAS':
            return decrypt_BMAS(encryptedStr, FRONT_KEY);
        default:
            // 自制低级密钥算法
            // 最终密钥：最大素数
            // 后端加密流程：
            // 大数 * 7 “+” md5(前端密钥) -> 后端密钥
            // 前端解密流程：
            // 后端密钥 “-” md5(前端密钥) / 7 -> 大数 -> 最大素数
            throw new Error(`不支持的加密算法: ${algorithm}`);
    }
}

// 加密函数统一入口
function encrypt(algorithm, encryptedStr) {
    // 输入：算法、后端密钥
    // 输出：最终密钥
    switch (algorithm) {
        case 'BMAS':
            return encrypt_BMAS(encryptedStr, FRONT_KEY);
        default:
            // 自制低级密钥算法
            // 最终密钥：最大素数
            // 后端加密流程：
            // 大数 * 7 “+” md5(前端密钥) -> 后端密钥
            // 前端解密流程：
            // 后端密钥 “-” md5(前端密钥) / 7 -> 大数 -> 最大素数
            throw new Error(`不支持的加密算法: ${algorithm}`);
    }
}

// 密钥获取函数 - 从金山文档表格中获取
function getKeyConfig() {
  // 记录旧密码
  if (globalKeyConfig) {
      // console.log('🚀 使用缓存的密钥配置');
      return globalKeyConfig;
  }
  ActivateSheet(sheetNameConfig)
  // 密文密码
  let i = 2
  DATA_READ_KEY = Application.Range("B" + i).Text;
  DATA_READ_algorithm = Application.Range("C" + i).Text;
  DATA_WRITE_KEY = Application.Range("D" + i).Text;
  DATA_WRITE_algorithm = Application.Range("E" + i).Text;
  globalKeyConfig = {
    "keys": [
        {
            "target": "data_read",
            "algorithm": DATA_READ_algorithm,
            "key": DATA_READ_KEY
        },
        {
            "target": "data_write",
            "algorithm": DATA_WRITE_algorithm,
            "key": DATA_WRITE_KEY
        }
    ]
  }
  // console.log(globalKeyConfig)
  return globalKeyConfig
}

// 密码获取函数 - 从金山文档中获取
function getPassword(operationType, config) {
    // console.log(config)
    // 空值保护
    if (!config || !config.keys) {
        throw new Error('❌ 密钥配置格式错误：缺少必要字段');
    }

    // 传统循环替代find
    let targetKey = null;
    for (let i = 0; i < config.keys.length; i++) {
        if (config.keys[i].target === operationType) {
            targetKey = config.keys[i];
            break;
        }
    }

    if (!targetKey) {
        throw new Error(`❌️ 未找到${operationType}操作的密钥配置`);
    }
    
    return {
        password: decrypt(targetKey.algorithm, targetKey.key),
        algorithm: targetKey.algorithm
    };
}

// 生成8位随机密码
function keyRandom() {
    // 定义字符集：大小写字母+数字（排除易混淆字符0/O,1/I等）
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let key = '';
    
    // 生成8位随机密码
    for(let i = 0; i < 8; i++) {
        key += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // 增强型校验：确保至少包含1个数字和1个字母
    if(!/\d/.test(key) || !/[a-zA-Z]/.test(key)) {
        return keyRandom(); // 递归重试
    }
    
    return key;
}

// 密钥生成、加密 - 随机明文密钥 -> 密文密钥
function keyCreate(algorithm) {
  key_clear = keyRandom()
  key = encrypt(algorithm, key_clear)
  console.log("🔏 最新密钥明文：", key_clear, " 密文：", key, " 算法：", algorithm)
  return key
}

// 修改密钥文件内容
function keyRefresh() {
  // 将新加密密钥重写进密钥文件、将密钥记录到金山文档表格中
  key = getPassword("data_read", getKeyConfig());  // 先保存上一次密码到全局变量中，以便能解读文件
  console.log("🔓️ 旧密钥密文：", key)
  // console.log(key)
  // 密码生成
  algorithm = 'BMAS'
  DATA_READ_KEY = keyCreate(algorithm)
  DATA_READ_algorithm = algorithm
  DATA_WRITE_KEY = keyCreate(algorithm)
  DATA_WRITE_algorithm = algorithm

  message = {
      "version": "2.0",
      "description": "漂流瓶系统安全密钥",
      "timestamp": timestampCreate(),
      "keys": [
        {
          "target": "data_read",
          "algorithm": DATA_READ_algorithm,
          "key": DATA_READ_KEY, // "<'XB<[-",
        },
        {
          "target": "data_write",
          "algorithm": DATA_WRITE_algorithm,
          "key": DATA_WRITE_KEY, // "<'XB<[-",
        }
      ]
    }
  // console.log(message)
  writeNecutData(NETCUT_KEY_READ, KEY_READ_KEY, message)

  // 记录新密码
  globalKeyConfigNew = {
      "keys": [
        {
          "target": "data_read",
          "algorithm": DATA_READ_algorithm,
          "key": DATA_READ_KEY, // "<'XB<[-",
        },
        {
          "target": "data_write",
          "algorithm": DATA_WRITE_algorithm,
          "key": DATA_WRITE_KEY, // "<'XB<[-",
        }
      ]
    }
  // console.log(globalKeyConfigNew)

  // 修改金山文档CONFIG表
  let j = 2
  if(version == 1){
    // airscipt 1.0
    Application.Range(colNum[1] + j).Value = DATA_READ_KEY // 仅读文件密码
    Application.Range(colNum[2] + j).Value = DATA_READ_algorithm // 仅读文件密码加密算法
    Application.Range(colNum[3] + j).Value = DATA_WRITE_KEY // 仅写文件密码
    Application.Range(colNum[4] + j).Value = DATA_WRITE_algorithm // 仅写文件密码加密算法
  }else{
    // airscript 2.0(Beta)
    Application.Range(colNum[1] + j).Value2 = DATA_READ_KEY // 仅读文件密码
    Application.Range(colNum[2] + j).Value2 = DATA_READ_algorithm // 仅读文件密码加密算法
    Application.Range(colNum[3] + j).Value2 = DATA_WRITE_KEY // 仅写文件密码
    Application.Range(colNum[4] + j).Value2 = DATA_WRITE_algorithm // 仅写文件密码加密算法
  }

}

// ================================1. 密钥生成、加密、存储结束================================


// ================================2. 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”，修改密码数据开始================================
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
  ActivateSheet(sheetNameData)
  let rowcol = getRowCol() 
  let workUsedRowEnd = rowcol[0]  // 行，已存在数据的最后一行
  note_content = strTojson(note_content)
  // console.log(workUsedRowEnd)
  // console.log(note_content.length)
  for(let i = 0; i < note_content.length; i++) {
    row = workUsedRowEnd + 1 + i  // 从不存在数据的地方开始写入数据
    timestamp = note_content[i]["timestamp"]
    message = note_content[i]["message"]
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
// ================================2. 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”，修改密码数据结束================================

// ================================3. 根据金山文档数据选择漂流瓶更新“仅读文件”，修改密码开始================================
// 指定区间范围内的随机数值，[min, max]，抽取count个，少于count则全取
function generateRandomValuesOptimized(min, max, num) {
    if (typeof min !== 'number' || typeof max !== 'number' || min > max) return [];
    
    const result = new Set();
    const range = max - min + 1;
    const count = Math.min(num, range);

    while(result.size < count) {
        const randomNum = Math.floor(Math.random() * range) + min;
        result.add(randomNum);
    }

    return Array.from(result).sort(() => Math.random() - 0.5);
}

// 随机抽取指定数量漂流瓶
function messageCreate(count) {
  ActivateSheet(sheetNameData)
  let rowcol = getRowCol() 
  let workUsedRowEnd = rowcol[0]  // 行，已存在数据的最后一行
  // console.log(workUsedRowEnd)
  // 随机从2-workUsedRowEnd中选择50条数据
  // 如果workUsedRowEnd<50，则取走全部数据
  messageArray = []
  randomValuesArray = generateRandomValuesOptimized(2, workUsedRowEnd, count)
  randomValuesArray.forEach((item, index) => {
      // console.log(`第${index + 1}个元素：`, item);
      timestamp = Application.Range(colNum[0] + item).Text;
      message = Application.Range(colNum[1] + item).Text;
      messageArray.push({
        "message" : message,
        "timestamp" : timestamp
      })
  }); 
  return messageArray 
}

function data_read_handle() {
  // 获取“仅写文件”密码
  key = getPassword("data_read", getKeyConfig())
  // console.log(key)
  // 从金山文档中选一些数据，构造成message
  message = messageCreate(50)
  // console.log(message)
  key_new = getPassword("data_read", globalKeyConfigNew)  // 新密码
  // console.log(key_new)

  result = writeNecutData(NETCUT_DATA_READ, key.password, message, key_new.password)

}
// ================================3. 根据金山文档数据选择漂流瓶更新“仅读文件”，修改密码结束================================

// ================================业务逻辑结束================================


// ================================初始化开始================================

// 表格初始化
function initTable(){
  checkVesion() // 版本检测，以进行不同版本的适配

  storeWorkbook()
  createSheet(sheetNameData)
  ActivateSheet(sheetNameData)
  editConfigSheet(contentData)

  createSheet(sheetNameConfig)
  ActivateSheet(sheetNameConfig)
  editConfigSheet(contentConfig)
}

// 后端初始化
function init() {
  // getKeyConfig()
  keyRefresh()        // 密钥文件
  data_write_handle() // 仅写文件
  data_read_handle()  // 仅读文件
}

function main() {
  initTable();
  init()
}

main()

function test() {
  initTable();
  globalKeyConfig = {
    "version": "2.0",
    "description": "漂流瓶系统安全密钥",
    "timestamp": "2025-04-18 10:39:13",
    "keys": [
      {
        "target": "data_read",
        "algorithm": "BMAS",
        "key": "<'XB<[-"
      },
      {
        "target": "data_write",
        "algorithm": "BMAS",
        "key": "<'XB<[-"
      }
    ]
  }

  globalKeyConfigNew = {
    "version": "2.0",
    "description": "漂流瓶系统安全密钥",
    "timestamp": "2025-04-18 10:39:13",
    "keys": [
      {
        "target": "data_read",
        "algorithm": "BMAS",
        "key": "<'XB<[-"
      },
      {
        "target": "data_write",
        "algorithm": "BMAS",
        "key": "<'XB<[-"
      }
    ]
  }
  // data_write_handle()
  data_read_handle()

}
// test()
// ================================初始化结束================================

