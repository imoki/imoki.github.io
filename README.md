<div align="center">
    <img src="https://socialify.git.ci/imoki/imoki.github.io/image?description=1&font=Rokkitt&forks=1&issues=1&language=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark">
<h1>🌊 金山漂流瓶</h1>
基于「金山文档」的漂流瓶项目 | 零成本·高安全·云存储方案

<div id="shield">

[![][github-stars-shield]][github-stars-link]
[![][github-forks-shield]][github-forks-link]
[![][github-issues-shield]][github-issues-link]
[![][github-contributors-shield]][github-contributors-link]

<!-- SHIELD GROUP -->
</div>
</div>

## 🍻 交流渠道  
<a href="https://space.bilibili.com/3546828310055281">B站：**无盐七**</a>  
QQ群：**963592267**  
公众号：**默库**  

## 🎊 简介
**零成本、无需懂代码部署带后台的高安全WEB项目**  
1. 若github pages部署纯前端网页，缺乏后端数据支持，若增加后端服务器又可能增加维护成本。  
本项目利用金山文档，通过全链条零成本设计方案，实现无需服务器，又可具备一定后端处理能力的网站项目，增加可玩性。  
2. 由于若采用官网提供的**webhook + 令牌方式**部署网页会出现跨站问题，因此需要一层中介来解决此类问题。  
本项目在金山文档与前端网页之间增加一层中介，从而解决了跨站问题。  
3. 为了增加安全性，以避免暴露金山文档后台，因此采用**中间层 + 密钥分配算法**设计。  
采用github pages + netcut + 金山云文档的形式，实现具备一定的安全性、交互性的网站。
4. 为了实现数据存储和数据处理。  
采用金山云文档平替代“云数据库”，采用Airscript定时脚本进行数据处理。  
5. 提高扩展能力。  
本项目设计思路可实现更过有趣功能噢～  

## ✨ 特性
    - 📀 解决CORS跨域问题
    - 💿 低代码部署
    - ♾️ 零本方案
    - 💽 一定交互能力
    - 🔥 兼容airscript 1.0和airscript 2.0(Beta)

## 📺️ 视频教程
[![](https://img.shields.io/badge/金山推送器-无盐七-blue)](https://www.bilibili.com/video/BV1bXckehEdn) https://www.bilibili.com/video/BV1bXckehEdn/
  
## 🛰️ 文字部署步骤
1. 显示层：fork或直接复制项目代码到你的仓库，仓库名为xxx.github.io。（这里的xxx为你github的昵称。自动会启用github page。）  
2. 中间层：创建三个带密码（默认为：imoki）的netcut文件，名称分别为xxx_key_read、xxx_data_read、xxx_data_write。（这里的xxx为你自定义的昵称）  
3. 修改代码开头提示的配置：将中间层的三个文件链接覆盖掉代码中（需要修改的部分）链接 。（仅改动script.js和services.js开头部分即可）  
4. 数据层：将services.js脚本复制到金山文档Airscript脚本编辑器中，添加网络API，并加入定时任务。  
5. 此时访问**https://xxx.github.io**，就可以访问到你的WEB项目啦。  

## ⭐ 架构说明
三级设计方案：**显示层 - 中间层 - 数据层**  
显示层 - 采用Github Pages进行部署  
中间层 - 采用netcut临时文本进行缓存  
数据层 - 采用金山云文档进行存储和处理  
前端 - 即显示层（index.html、script.js、style.css）  
后端 - 即中间层（“密钥文件”、“仅读文件”、“仅写文件”）与数据层（services.js）   

## 🌈 业务流程
**前端处理流程**  
1. 密钥获取、解密、缓存 - 安全处理  
2. 通过“读密码”读取“仅读文件”数据 - 拿漂流瓶  
3. 通过“写密码”写入“仅写文件”数据 - 扔漂流瓶  
  
**后端处理流程** 
1. 密钥生成、加密、存储、修改 - 安全处理  
2. 读取“仅写文件”数据，将数据写入金山文档，清空“仅写文件”，修改密码 - 更新数据库漂流瓶集  
3. 根据金山文档数据选择漂流瓶更新“仅读文件”，修改密码 - 更新临时漂流瓶集  

## 🧾文件说明
“密钥文件” - 文件名称为：xxx_key_read。“仅读文件”、“仅写文件”的密文密码  
“仅读文件” - 文件名称为：xxx_data_read。临时漂流瓶集，前端从此文件中获取最新漂流瓶数据  
“仅写文件” - 文件名称为：xxx_data_write。扔漂流瓶集，前端向此文件中追加漂流瓶数据，后端从此文件中获取最新漂流瓶数据  
“读密码” - 默认设置为：imoki。“仅读文件”的明文密码  
“写密码” - 默认设置为：imoki。“仅写文件”的明文密码  
金山文档密钥数据 - “读密码”、“写密码”的密文密码  
金山文档用户数据 - 数据库漂流瓶集  

## 🔒 安全设计
出于安全考虑，避免数据爬虫、数据篡改、数据窃取，所以设计一些安全机制。  
中间层：仅缓存部分数据，对中间层文件都设置动态密码，通过数据层生成动态密码并自动分配最新密码，避免数据爬虫、篡改。  
数据层：存储着所有信息，对密码存储采用密文形式，避免数据窃取，即使被脱库数据也不会以明文显示。  
加解密算法：采用非常规自定义的BMAS算法，代码中也开放了加解密增添入口，可以方便拓展你自己设计的加解密算法，以实现更高安全性。 

## 🤝 欢迎参与贡献
欢迎各种形式的贡献

[![][pr-welcome-shield]][pr-welcome-link]

<!-- ### 💗 感谢我们的贡献者
[![][github-contrib-shield]][github-contrib-link] -->


## ✨ Star 数

[![][starchart-shield]][starchart-link]

## 📝 更新日志 
- 2025-04-18
    * 推出基于金山文档的漂流瓶项目

<!-- ## 📌 特别声明

- 本仓库发布的脚本仅用于测试和学习研究，禁止用于商业用途，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断。

- 本人对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害。

- 间接使用脚本的任何用户，包括但不限于建立VPS或在某些行为违反国家/地区法律或相关法规的情况下进行传播, 本人对于由此引起的任何隐私泄漏或其他后果概不负责。

- 请勿将本仓库的任何内容用于商业或非法目的，否则后果自负。

- 如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我们将在收到认证文件后删除相关脚本。

- 任何以任何方式查看此项目的人或直接或间接使用该项目的任何脚本的使用者都应仔细阅读此声明。本人保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或Script项目的规则，则视为您已接受此免责声明。

**您必须在下载后的24小时内从计算机或手机中完全删除以上内容**

> ***您使用或者复制了本仓库且本人制作的任何脚本，则视为 `已接受` 此声明，请仔细阅读*** -->

<!-- LINK GROUP -->
[github-codespace-link]: https://codespaces.new/imoki/imoki.github.io
[github-codespace-shield]: https://github.com/imoki/imoki.github.io/blob/main/images/codespaces.png?raw=true
[github-contributors-link]: https://github.com/imoki/imoki.github.io/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/imoki/imoki.github.io?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/imoki/imoki.github.io/network/members
[github-forks-shield]: https://img.shields.io/github/forks/imoki/imoki.github.io?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/imoki/imoki.github.io/issues
[github-issues-shield]: https://img.shields.io/github/issues/imoki/imoki.github.io?color=ff80eb&labelColor=black&style=flat-square
[github-stars-link]: https://github.com/imoki/imoki.github.io/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/imoki/imoki.github.io?color=ffcb47&labelColor=black&style=flat-square
[github-releases-link]: https://github.com/imoki/imoki.github.io/releases
[github-releases-shield]: https://img.shields.io/github/v/release/imoki/imoki.github.io?labelColor=black&style=flat-square
[github-release-date-link]: https://github.com/imoki/imoki.github.io/releases
[github-release-date-shield]: https://img.shields.io/github/release-date/imoki/imoki.github.io?labelColor=black&style=flat-square
[pr-welcome-link]: https://github.com/imoki/imoki.github.io/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[github-contrib-link]: https://github.com/imoki/imoki.github.io/graphs/contributors
[github-contrib-shield]: https://contrib.rocks/image?repo=imoki%2Fsign_script
[docker-pull-shield]: https://img.shields.io/docker/pulls/imoki/imoki.github.io?labelColor=black&style=flat-square
[docker-pull-link]: https://hub.docker.com/repository/docker/imoki/imoki.github.io
[docker-size-shield]: https://img.shields.io/docker/image-size/imoki/imoki.github.io?labelColor=black&style=flat-square
[docker-size-link]: https://hub.docker.com/repository/docker/imoki/imoki.github.io
[docker-stars-shield]: https://img.shields.io/docker/stars/imoki/imoki.github.io?labelColor=black&style=flat-square
[docker-stars-link]: https://hub.docker.com/repository/docker/imoki/imoki.github.io
[starchart-shield]: https://api.star-history.com/svg?repos=imoki/wpsPython&type=Date
[starchart-link]: https://api.star-history.com/svg?repos=imoki/wpsPython&type=Date

