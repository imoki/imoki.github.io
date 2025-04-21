<div align="center">
    <img src="https://socialify.git.ci/imoki/imoki.github.io/image?description=1&font=Rokkitt&forks=1&issues=1&language=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark">
<h1>🌐 金山博客系统</h1>
基于「金山文档」的博客系统 | 零成本·极简单·云存储方案

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
**零成本、无需懂代码部署博客系统**  
1. 若github pages部署纯前端网页，缺乏后端数据支持，若增加后端服务器又可能增加维护成本。  
本项目利用金山文档，通过全链条零成本设计方案，实现无需服务器，又可具备一定后端处理能力的网站项目，增加可玩性。  
2. 由于若采用官网提供的**webhook + 令牌方式**部署网页会出现跨站问题，因此需要一层中介来解决此类问题。  
本项目使用金山文档与前端网页之间增加一层中间层，从而解决了跨站问题，中间层采用github issues实现。  
3. 为了增加安全性，以避免暴露金山文档后台。  
采用github pages + github issues + 金山云文档的形式，实现具备一定的安全性、交互性的网站。
4. 为了实现数据存储和数据处理。  
采用金山云文档平替代“云数据库”，采用Airscript脚本进行数据处理。  
5. 提高扩展能力。  
本项目设计思路可实现更过有趣功能噢～  

## ✨ 特性
    - 📀 解决CORS跨域问题
    - 💿 低代码部署，部署简单
    - ♾️ 零成本方案
    - 💽 文章发布简单，采用增量更新，效率较高
    - 🔥 兼容airscript 1.0和airscript 2.0(Beta)

## 📺️ 视频教程
[![](https://img.shields.io/badge/金山推送器-无盐七-blue)](https://www.bilibili.com/video/BV1hb5sz6EaT) https://www.bilibili.com/video/BV1hb5sz6EaT
  
## 🛰️ 文字部署步骤
1. 显示层：fork或直接复制项目代码到你的仓库，仓库名为xxx.github.io。（这里的xxx为你github的昵称。自动会启用github page。）  
2. 修改代码开头提示的配置：仅改动script.js和services.js开头（需要修改的部分）部分即可  
3. 数据层：将services.js脚本复制到金山文档Airscript脚本编辑器中，添加网络API，首次运行会自动生成表格，填写此表格，再运行即可发布文章。之后要更新文章，直接修改表格后运行services.js脚本即可更新成功。  
4. 此时就可以访问到你的WEB项目啦。 访问：https://xxx.github.io  

## ⭐ 架构说明
三级设计方案：**显示层 - 中间层 - 数据层**  
显示层 - 采用Github Pages进行部署  
中间层 - 采用Github Issues进行缓存  
数据层 - 采用金山云文档进行存储和处理  
前端 - 即显示层（index.html、script.js、style.css）  
后端 - 即中间层与数据层（services.js）   

## 🌈 业务流程
**前端处理流程**  
对中间层数据进行处理，并渲染出文章等数据 - 拿文章  
  
**后端处理流程** 
读取金山文档表格，对表格数据处理后，同步到中间层 - 发文章  
对于“文章表”文章置为“不发布”采用虚删方式，仅将github issues内容置空，不删标题 - 删文章
通过一致性校验检测内容变动，仅对变化的部分进行更新，提高执行效率 - 增量更新

## 🧾文件说明
“[博客_配置]” - 是博客项目的配置  
“[博客_文章]” - 是博客项目的文章  
“GITHUB TOKEN“ - 在金山文档的”配置“表中填写，这是操控你仓库的认证信息，这是隐私信息，请不要泄露。  
”文章“ - 在金山文档的”文章“表中填写，支持html格式。填写完运行后端脚本即可发布文章  
“GITHUB TOKEN”获取方式 - 在 https://github.com/settings/tokens 选择 “Generate new token (classic) “，生成token 

## 🤝 欢迎参与贡献
欢迎各种形式的贡献

[![][pr-welcome-shield]][pr-welcome-link]

<!-- ### 💗 感谢我们的贡献者
[![][github-contrib-shield]][github-contrib-link] -->


## ✨ Star 数

[![][starchart-shield]][starchart-link]

## 📝 更新日志 
- 2025-04-21
    * 推出基于金山文档的博客系统  

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

