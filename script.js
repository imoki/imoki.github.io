// （需要修改的部分） 
// 读“密钥文件” - 仅读（只读链接） - 带密码（KEY_READ_KEY，默认：imoki），源链接：https://netcut.cn/imoki_key_read
const NETCUT_KEY_READ = "https://netcut.cn/p/198ff0887be153df"  
// 读“仅读文件” - 仅读（只读链接） - 带密码（DATA_READ_KEY，默认：imoki），源链接：https://netcut.cn/imoki_data_read
const NETCUT_DATA_READ = "https://netcut.cn/p/d270347e14a3ad28"
// 写“仅写文件” - 写（剪贴板链接） - 带密码（DATA_WRITE_KEY，默认：imoki），源链接：https://netcut.cn/imoki_data_write
const NETCUT_DATA_WRITE = "https://netcut.cn/imoki_data_write"

// （可变可不变）
// 前端内置密钥 - 需要与金山文档后端中的前端密码一致
const FRONT_KEY = "imoki"    // 默认
// 读密钥文件的密钥 - “密钥文件”的密码
const KEY_READ_KEY = "imoki";   // 默认

// ================================全局配置开始================================
// 全局配置存储
let globalKeyConfig = null;
// 漂流瓶缓存
let cachedBottles = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟
// 默认数据
const defaultBottles = [
    { message: "🐚 这是一个来自大海的问候！", timestamp: "2023-11-02 16:00:00" },
    { message: "🌊 你找到我的漂流瓶啦！", timestamp: "2024-08-05 13:02:04" }
];
// ================================全局配置结束================================


// ================================业务逻辑开始================================
// 背景：
// 零成本部署带后台的网页。
// 若github pages部署纯前端网页，可玩性不高，若采用自建服务器又可能增加维护成本。
// 因此本项目通过全链条免费设计，实现无需服务器，又可具备一定后端处理能力的网站项目。
// 采用github pages + netcut + 金山云文档的形式，实现具备一定的安全性、交互性的网站。

// 架构说明：
// 三级设计：显示层 - 中间层 - 数据层
// 前端 - 即显示层（index.html、script.js、styles.css）
// 后端 - 即中间层（“密钥文件”、“仅读文件”、“仅写文件”）与数据层（services.js）
// 显示层 - 采用Github Pages进行部署
// 中间层 - 采用netcut临时文本进行缓存
// 数据层 - 采用金山云文档进行存储和处理

// 安全设计：
// 处于安全考虑，即避免数据爬虫、数据篡改、数据窃取，所以设计一些安全机制。
// 中间层仅缓存部分数据，对中间层文件都设置动态密码，通过数据层生成动态密码并自动分配最新密码，避免数据爬虫、篡改
// 数据层存储着所有信息，对密码存储采用密文形式，避免数据窃取，即使被脱库数据也不会以明文显示
// 加解密算法采用非常规自定义的BMAS算法，代码中也开放了加解密增添入口，可以方便拓展你自己设计的加解密算法，以实现更高安全性

// 前端处理流程：
// 1. 密钥获取、解密、缓存 - 安全处理
// 2. 通过“读密码”读取“仅读文件”数据 - 拿漂流瓶
// 3. 通过“写密码”写入“仅写文件”数据 - 扔漂流瓶

// 后端处理流程：
// 1. 密钥生成、加密、存储、修改 - 安全处理
// 2. 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”，修改密码 - 更新数据库漂流瓶集
// 3. 根据金山文档数据选择漂流瓶更新“仅读文件”，修改密码 - 更新临时漂流瓶集

// 文件说明：
// “密钥文件” - “仅读文件”、“仅写文件”的密文密码
// “仅读文件” - 临时漂流瓶集，前端从此文件中获取最新漂流瓶数据
// “仅写文件” - 扔漂流瓶集，前端向此文件中追加漂流瓶数据，后端从此文件中获取最新漂流瓶数据
// “读密码” - “仅读文件”的明文密码
// “写密码” - “仅写文件”的明文密码
// 金山文档密钥数据 - “读密码”、“写密码”的密文密码
// 金山文档用户数据 - 数据库漂流瓶集

// 密钥说明：
// KEY_READ_KEY - “密钥文件”
// DATA_READ_KEY和DATA_WRITE_KEY是后端自动分配并动态变化的，需要用解密算法获得最终密钥
// 最终密钥 = 解密算法（后端密钥+前端密钥）

// ================================业务逻辑共用函数开始================================
// 显示消息提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    // 3秒后自动隐藏消息提示
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 错误显示
function showError(msg) {
    document.getElementById('error').textContent = `错误: ${msg}`;
    setTimeout(() => document.getElementById('error').textContent = '', 5000);
}

// 读内容 - netcut.cn
async function getNetcutData(url, note_pwd){
    result = ""
    // https://netcut.cn
    note_id = get_note_id(url)
    api_url = "https://api.txttool.cn/netcut/note/info/"

    // 使用URLSearchParams处理表单数据
    const formData = new URLSearchParams();
    formData.append('note_id', note_id);    // id
    formData.append('note_pwd', note_pwd);  // 密码
    // formData.append('note_pwd', encodeURIComponent(note_pwd));// 密码
    // console.log(formData)
    // console.log(formData.toString()); 
    
    // 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 使用fetch API发送请求
    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const resp = await response.json();

    // console.log(resp)
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

// 写内容 - 覆盖 - netcut.cn
async function writeNecutData(url, note_pwd, note_content){
    let result = []
    // https://netcut.cn
    note_name = get_note_id(url)
    note = await getNetcutInfo(note_name, note_pwd)
    console.log(note)
    note_id = note["note_id"]
    note_token = note["note_token"]
    url = "https://api.txttool.cn/netcut/note/save/"
    // 使用URLSearchParams处理表单数据
    const formData = new URLSearchParams();
    formData.append('note_name', note_name);
    formData.append('note_id', note_id);    // id
    formData.append('note_content', note_content);
    formData.append('note_token', note_token); 
    formData.append('note_pwd', note_pwd);
    formData.append('expire_time', 94608000);  // 设置网络剪贴板有效期三年
    // console.log(formData)
    // console.log(formData.toString()); 
    
    // 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 使用fetch API发送请求
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const resp = await response.json();
    // console.log(resp)
    status = resp["status"]
    if(status == 1){
    // console.log("✅ 写入数据成功")
    updated_time = resp["data"]["time"] // 更新时间
    result[0] = status
    result[1] = formatDate(updated_time)  // 2024-07-20 21:33:22 -> 2024/7/23 10:00
    // console.log(result)
    }else{
    result[0] = status
    }

    return result
}

// json追加
function append_json(note_content, message) {
    try {
        // 1. 处理空值和初始化数据结构
        let jsonData = [];
        if (note_content) {
            // 2. 过滤特殊字符（保留JSON必须的符号{}[]:",）
            const sanitized = note_content.replace(/[^\w{}\[\]",:\/\-\s]/g, '');
            // console.log(sanitized)
            // 3. 容错解析JSON
            jsonData = JSON.parse(sanitized);
            if (!Array.isArray(jsonData)) {
                console.warn('数据格式异常，重置为数组');
                jsonData = [];
            }
        }

        // 4. 构造新的漂流瓶对象
        const newBottle = {
            // message: message.replace(/[^\w\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ''), // 过滤危险字符，含emoji等
            // timestamp: new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
            message: message.replace(/[<>"\\]/g, ''), // 仅过滤XSS相关字符，仅过滤 < > " \ 四个危险字符，保留emoji、中文、特殊符号等
            timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1].split('.')[0] // YYYY-MM-DD HH:mm:ss格式
        };

        // 5. 添加新数据并返回JSON字符串
        jsonData.push(newBottle);
        return JSON.stringify(jsonData, null, 2); // 带格式的JSON

    } catch (error) {
        console.error('JSON处理失败，返回默认结构:', error);
        return JSON.stringify([message], null, 2); // 极端情况保底处理
    }
}

// 追加 - 自定义格式追加
async function addNecutData(url, note_pwd, message){
    let result = []
    // https://netcut.cn
    note_name = get_note_id(url)
    note = await getNetcutInfo(note_name, note_pwd)
    // console.log(note)
    note_id = note["note_id"]
    note_token = note["note_token"]
    note_content = note["note_content"]
    note_content = append_json(note_content, message)


    url = "https://api.txttool.cn/netcut/note/save/"
    // 使用URLSearchParams处理表单数据
    const formData = new URLSearchParams();
    formData.append('note_name', note_name);
    formData.append('note_id', note_id);    // id
    formData.append('note_content', note_content);
    formData.append('note_token', note_token); 
    formData.append('note_pwd', note_pwd);
    formData.append('expire_time', 94608000);  // 设置网络剪贴板有效期三年
    // console.log(formData)
    // console.log(formData.toString()); 
    
    // 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 使用fetch API发送请求
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const resp = await response.json();
    // console.log(resp)
    status = resp["status"]
    if(status == 1){
    // console.log("✅ 写入数据成功")
    updated_time = resp["data"]["time"] // 更新时间
    result[0] = status
    result[1] = formatDate(updated_time)  // 2024-07-20 21:33:22 -> 2024/7/23 10:00
    // console.log(result)
    }else{
    result[0] = status
    }

    return result
}

// 获取信息，含id、token
async function getNetcutInfo(note_name, note_pwd){
    // console.log("✨ 获取token")
    url = "https://api.txttool.cn/netcut/note/info/"

    const formData = new URLSearchParams();
    formData.append('note_name', note_name);
    formData.append('note_pwd', note_pwd);
    // console.log(formData)
    // console.log(formData.toString()); 
    
    // 添加请求超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 使用fetch API发送请求
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const resp = await response.json();
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


// ================================1. 密钥获取、解密、缓存开始================================
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

// 密钥获取函数
async function getKeyConfig() {
    if (globalKeyConfig) {
        // console.log('🚀 使用缓存的密钥配置');
        return globalKeyConfig;
    }
    try {
        // console.log('🪄 获取密钥配置');
        const config = await getNetcutData(NETCUT_KEY_READ, KEY_READ_KEY);
        // console.log(config)
        // 增强配置验证
        if (!config.version || !config.keys || !Array.isArray(config.keys)) {
            throw new Error('❌ 无效的密钥配置格式');
        }
        
        // 缓存到全局变量
        globalKeyConfig = config;
        console.log('密钥配置已缓存:', config);
        return config;
    } catch (error) {
        showError(`❌ 密钥配置获取失败: ${error.message}`);
        throw error;
    }
}

// 密码获取函数 - 解密封装
async function getPassword(operationType) {
    const config = await getKeyConfig();
    const keyConfig = config.keys.find(k => k.target === operationType);
    
    if (!keyConfig) {
        throw new Error(`❌️ 未找到${operationType}操作的密钥配置`);
    }
    // console.log(decrypt(keyConfig.algorithm, keyConfig.key))
    return {
        password: decrypt(keyConfig.algorithm, keyConfig.key),
        algorithm: keyConfig.algorithm
    };
}
// ================================1. 密钥获取、解密、缓存结束================================


// ================================2. 通过“读密码”读取“仅读文件”数据开始================================

// 获取漂流瓶数据 - 无缓存取法
async function fetchBottles_nocache() {
    // console.log("✨ 获取漂流瓶数据")
    try {

        // 使用密码读取数据
        const key_read = await getPassword('data_read');
        // console.log('读密码:', key_read);
        // console.log(key_read.password)
        const netcutBottles = await getNetcutData(NETCUT_DATA_READ, key_read.password)

        // // 添加数据格式验证
        // if (!Array.isArray(result)) {
        //     throw new Error('Netcut数据格式错误，应为数组');
        // }

        // console.log(netcutBottles)
        // return [...defaultBottles, ...netcutBottles];
        return [...netcutBottles];
    } catch (error) {
        console.error('❌ 获取漂流瓶数据失败，使用默认数据:', error);
        return defaultBottles;
    }
}

// 获取漂流瓶数据函数 - 缓存取法
async function fetchBottles() {
    // console.log("✨ 获取漂流瓶数据");
    
    // 如果缓存有效且未过期，直接返回缓存数据
    if (cachedBottles && Date.now() - lastFetchTime < CACHE_DURATION) {
        // console.log('🚀 使用缓存数据');
        return cachedBottles;
    }

    try {
        // 使用密码读取数据
        const key_read = await getPassword('data_read');
        const netcutBottles = await getNetcutData(NETCUT_DATA_READ, key_read.password);
        
        // 更新缓存
        cachedBottles = [...netcutBottles];
        lastFetchTime = Date.now();
        
        return cachedBottles;
    } catch (error) {
        console.error('❌ 获取漂流瓶数据失败:', error);
        
        // 如果有旧缓存则继续使用旧数据
        if (cachedBottles) {
            console.log('⚠️ 使用旧缓存数据');
            return cachedBottles;
        }
        
        // 没有缓存时返回默认数据
        return defaultBottles;
    }
}

// 捞漂流瓶的点击事件处理
document.getElementById('catchButton').addEventListener('click', async () => {
    try {
        const bottles = await fetchBottles();
        if (!bottles || bottles.length === 0) {
            showToast('🌊 暂时没有漂流瓶，晚点再来看看吧~');
            return;
        }
        // console.log('✨ 捞漂流瓶成功', bottles)

        // 随机选择新漂流瓶
        const randomIndex = Math.floor(Math.random() * bottles.length);
        const randomBottle = bottles[randomIndex];
        showEnvelope(randomBottle);
    } catch (error) {
        console.error('捞漂流瓶失败:', error);
        showToast('❌ 捞瓶子失败，请检查网络后重试');
    }
});

// 显示信封函数
function showEnvelope(bottleData) {
    const envelope = document.createElement('div');
    envelope.classList.add('envelope-container');
    envelope.innerHTML = `
        <div class="envelope">
            <div class="envelope-header">
                <span>🫙 漂流瓶</span>
                <button class="close-button">×</button>
            </div>
            <div class="envelope-body">
                <div class="message-content">
                    <p>${bottleData.message}</p>
                    <small class="timestamp">${bottleData.timestamp}</small>
                </div>
                <div class="reply-section">
                    <!--<textarea class="reply-input" placeholder="写下你的弹幕..."></textarea>-->
                    <div class="button-group">
                        <button id="reCatch" class="reply-button">重捞一个</button>
                        <!--<button id="sendReply" class="reply-button">发送弹幕</button>-->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(envelope);

    // 添加动画
    setTimeout(() => {
        envelope.querySelector('.envelope').classList.add('open');
    }, 50);

    // 关闭按钮
    envelope.querySelector('.close-button').addEventListener('click', () => {
        envelope.querySelector('.envelope').classList.remove('open');
        setTimeout(() => envelope.remove(), 300);
    });

    // 重捞功能
    envelope.querySelector('#reCatch').addEventListener('click', async () => {
        try {
            const bottles = await fetchBottles();
            if (!bottles || bottles.length === 0) {
                showToast('🌊 暂时没有漂流瓶，晚点再来看看吧~');
                return;
            }

            // 移除当前信封
            envelope.querySelector('.envelope').classList.remove('open');
            setTimeout(() => envelope.remove(), 300);

            // 随机选择新漂流瓶
            const randomIndex = Math.floor(Math.random() * bottles.length);
            const randomBottle = bottles[randomIndex];
            
            // 显示新漂流瓶（延迟保证动画效果）
            setTimeout(() => showEnvelope(randomBottle), 350);
        } catch (error) {
            console.error('重捞失败:', error);
            showToast('❌ 重捞失败，请稍后重试');
        }
    });

    // // 发送弹幕功能（示例逻辑）
    // envelope.querySelector('#sendReply').addEventListener('click', () => {
    //     console.log('发送弹幕');
    //     // 实现发送弹幕逻辑
    // });
}


// ================================2. 通过“读密码”读取“仅读文件”数据结束================================

// ================================3. 通过“写密码”写入“仅写文件”数据结束================================        
// 扔漂流瓶功能
async function throwBottle() {
    const message = document.getElementById('newBottle').value;
    if (!message) return;

    try {
        const key = await getPassword('data_write');
        await addNecutData(NETCUT_DATA_WRITE, key.password, message);

        // 使用消息提示代替alert
        showToast('✨ 漂流瓶已扔出！');
    } catch (error) {
        console.error('发送失败:', error);
        showToast('❌ 漂流瓶扔出失败，请重试！');
    }
}

document.getElementById('throwButton').addEventListener('click', () => {
    const message = document.getElementById('newBottle').value;
    
    // 添加空值校验
    if (!message.trim()) {
        showToast('🚩 漂流瓶内容不能为空哦~');
        document.getElementById('newBottle').focus(); // 自动聚焦输入框
        return; // 阻止后续执行
    }

    throwBottle()

    // 原有动画逻辑
    const bottle = document.createElement('div');
    bottle.classList.add('floating-bottle');
    bottle.style.left = `${Math.random() * 90}%`;
    bottle.style.top = '-50px';
    document.body.appendChild(bottle);

    setTimeout(() => {
        bottle.style.transition = 'transform 2s ease-in-out';
        bottle.style.transform = 'translateY(300px)';
    }, 100);

    setTimeout(() => bottle.remove(), 2100);
});

// ================================3. 通过“写密码”写入“仅写文件”数据结束================================




// ================================业务逻辑结束================================


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


// ================================测试开始================================
// 测试
async function test() {
    console.log("测试")
    try {
        // KEY =  await getPassword(NETCUT_KEY_READ, KEY);
        // result = await getNetcutData(NETCUT_DATA_READ, KEY)  
        // console.log(result)
        // testGetKey()

    } catch (error) {
        console.error('获取数据失败，使用默认数据:', error);
        return defaultBottles;
    }
}


// 密钥获取测试函数
async function testGetKey() {
    try {
        // 获取全部密钥配置
        const config = await getKeyConfig();
        console.log('完整的密钥配置:', config);
        
        // 获取读密码
        const readKey = await getPassword('data_read');
        console.log('读密码:', readKey);
        
        // 获取写密码
        const writeKey = await getPassword('data_write');
        console.log('写密码:', writeKey);
        
        // 测试读取数据
        const result = await getNetcutData(NETCUT_DATA_READ, readKey.password);
        console.log('测试数据:', result);
    } catch (error) {
        console.error('测试失败:', error);
        showError(`测试失败: ${error.message}`);
    }
}

// 加解密测试案例
function testCryptoBMAS() {
    const testCases = [
        { input: "🌊电子漂流瓶", key: "imoki" },
        { input: "🚀Hello 世界", key: "imoki" },
        { input: "🐉🐲𝄞🎵", key: "imoki" },
        { input: "imoki", key: "imoki" }
    ];

    testCases.forEach(async ({input, key}) => {
        try {
            const encrypted = await encrypt_BMAS(input, key);
            const decrypted = await decrypt_BMAS(encrypted, key);
            
            console.log(`测试用例: ${input}`);
            console.log(`加密结果: ${encrypted}`);
            console.log(`解密结果: ${decrypted}`);
            console.log(`状态: ${input === decrypted ? '✅ 通过' : '❌ 失败'}`);
            console.log('='.repeat(50));
            
            if(input !== decrypted) {
                const originalBytes = new TextEncoder().encode(input);
                const decryptedBytes = new TextEncoder().encode(decrypted);
                console.log('字节对比:');
                console.log('原始:', Array.from(originalBytes));
                console.log('解密:', Array.from(decryptedBytes));
            }
        } catch (error) {
            console.error(`测试异常: ${error.message}`);
        }
    });
}

// ================================测试结束================================


// ================================初始化加载开始================================
// 展示漂流瓶
async function displayBottles() {
    const bottles = await fetchBottles();
    const container = document.getElementById('bottles');
    
    container.innerHTML = bottles
        .map(bottle => `
            <div class="bottle">
                <p>${bottle.message}</p>
                <small>${bottle.timestamp}</small>
            </div>
        `).join('');
}

// 刷新展示
async function refreshBottles() {
    try {
        const bottles = await fetchBottles();
        document.getElementById('bottles').innerHTML = bottles
            .map(b => `<div class="bottle">
                <p>${b.message}</p>
                <small>${new Date(b.timestamp).toLocaleString()}</small>
            </div>`).join('');
    } catch (error) {
        showError(`数据刷新失败: ${error.message}`);
    }
}

// 动态生成漂浮的漂流瓶
function createFloatingBottles(count) {
    for (let i = 0; i < count; i++) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle-icon');
        bottle.style.left = `${Math.random() * 90}%`;
        bottle.style.animationDuration = `${Math.random() * 3 + 3}s`;
        document.body.appendChild(bottle);
    }
}

// window.onload = function() {
//     createFloatingBottles(7); // 确保页面加载完成后执行
// };

// test();
// displayBottles();
// ================================初始化加载开始================================



