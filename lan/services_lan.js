/*
    作者: 无盐七
    仓库: https://github.com/imoki/
    B站：https://space.bilibili.com/3546828310055281
    QQ群：963592267
    公众号：默库
    
    脚本名称：services_lan.js
    脚本兼容: airsript 1.0、airscript 2.0
    更新时间：20250418
    脚本：金山文档漂流瓶后端处理程序。读取内容并返回。
*/

// （需要修改的部分） 

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


// ================================业务逻辑开始================================


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

}

var data = "a"
// 响应数据
function returnResult() {
  data = "hi"
}

function main() {
  initTable();
  init()
  returnResult()
  test ()
}

main()

return {
  data: data,
  test: Context.argv.name,
}

function test () {
  console.log(Context.argv.name)
  console.log(Context.argv.age)
}
// ================================初始化结束================================

