// （需要修改的配置）
// 替换为你的 GitHub 用户名和仓库名
const username = 'imoki';
const repo = 'imoki.github.io';
// API 地址
const apiUrl = `https://api.kkgithub.com/repos/${username}/${repo}/issues`;


// （以下不需要修改）
const TYPE = "博客" // 系统类型，用于区分不同系统
const CONFIG = "[" + TYPE + "_配置]" // 配置标识
const ARTICLE = "[" + TYPE + "_文章]" // 文章标识
const ARTICLE_ABSTRACT_NUM = 20;    // 文章摘要字数，设置为 0 不显示摘要

// 开关变量，设置为 true 使用模拟数据，设置为 false 使用真实的 GitHub API 数据
const USE_MOCK_DATA = false;
// 模拟数据
const mockIssues = [
    {
        id: 1,
        title: '[博客_文章]Web 开发技术的前世今生',
        user: { login: 'imoki' }, // 假设用户名为 imoki
        body: '在当今数字化的时代，Web 开发技术如同一场永不停歇的变革浪潮，不断推动着互联网的发展。<br><br><h3>早期 Web 开发（静态页面时代）</h3>在 Web 诞生之初，页面主要是静态的，使用简单的 HTML 标记语言来构建。那时的网页内容固定，缺乏交互性。<br>例如，最早的网站仅仅是一些文字和简单的图片展示，用于传递基本的信息。<br><br><h3>动态网页的兴起（CGI 时代）</h3>随着互联网的发展，用户对网页的交互性需求越高越高。于是，CGI（Common Gateway Interface）技术应运而生。<br>通过 CGI，服务器可以根据用户的请求动态生成页面内容，实现了简单的交互功能。<br><br><h3>Web 2.0 时代（AJAX 与前端框架）</h3>Web 2.0 标志着互联网从单纯的信息获取向互动和参与转变。AJAX（Asynchronous JavaScript and XML）技术的出现，使得网页可以在不刷新的情况下与服务器进行数据交互。<br>随后，各种前端框架如 jQuery、Angular、React 和 Vue.js 相继诞生，大大提高了前端开发的效率和用户体验。<br><br><h3>现代 Web 开发（全栈与微服务）</h3>如今，Web 开发已经进入了全栈和微服务的时代。开发者需要掌握前端、后端和数据库等多方面的知识。<br>微服务架构将一个大型应用拆分成多个小型服务，提高了系统的可维护性和扩展性。<br><br>总之，Web 开发技术的发展历程是一部不断创新和进步的历史，未来也将继续朝着更加智能、高效和便捷的方向发展。'
    },
    {
        id: 2,
        title: '[博客_文章]人工智能在医疗领域的应用与挑战',
        user: { login: 'imoki' }, // 假设用户名为 imoki
        body: '人工智能（AI）作为当今科技领域的热门话题，正逐渐渗透到各个行业，医疗领域也不例外。<br><br><h3>应用场景</h3><h4>疾病诊断</h4>AI 可以通过分析医学影像（如 X 光、CT 等）来辅助医生进行疾病诊断。例如，深度学习算法可以识别影像中的病变特征，提高诊断的准确性和效率。<br><br><h4>药物研发</h4>在药物研发过程中，AI 可以帮助科学家筛选潜在的药物靶点，预测药物的疗效和副作用，从而加速药物研发的进程。<br><br><h4>健康管理</h4>通过智能穿戴设备收集用户的健康数据，AI 可以为用户提供个性化的健康建议和预警，帮助用户预防疾病。<br><br><h3>挑战与问题</h3><h4>数据隐私与安全</h4>医疗数据涉及到患者的隐私，如何确保 AI 系统在处理和存储这些数据时的安全性和隐私性是一个重要的问题。<br><br><h4>算法可解释性</h4>一些复杂的 AI 算法（如深度学习）就像一个“黑匣子”，医生和患者很难理解算法的决策过程，这可能会影响 AI 在医疗领域的信任度和应用。<br><br><h4>法律与伦理问题</h4>当 AI 辅助诊断出现错误时，责任该如何界定？这涉及到一系列的法律和伦理问题，需要进一步的探讨和规范。<br><br>尽管面临诸多挑战，但人工智能在医疗领域的应用前景依然广阔，有望为人类的健康事业带来巨大的变革。'
    },
    {
        id: 3,
        title: '[博客_文章]十大火爆的 CMS 系统推荐',
        user: { login: 'imoki' }, // 假设用户名为 imoki
        body: '在如今的数字时代，拥有一个美观、功能强大的网站对于个人和企业来说至关重要。而选择一个适合自己需求的 CMS 系统，是搭建一个成功网站的关键一步。在本文中，我们将向大家推荐十个火爆的 CMS 系统，帮助你轻松搭建出令人瞩目的网站！<br><br><h3>01 - WordPress</h3>WordPress 是全球最受欢迎的 CMS 系统之一，拥有强大的扩展性和用户友好的界面。它提供了数千个主题和插件，让你可以轻松地创建出个性化的网站。无论你是个人博客、企业网站还是电子商务平台，WordPress 都能满足你的需求。目前，全球超过 30% 的网站都是使用 WordPress 搭建的，这充分证明了它的火爆程度。<br><strong>优点</strong>：主题、插件丰富，简单易用。<br><strong>缺点</strong>：安全性差，过于依赖插件，面向过程开发，二次扩展开发起点高；对于大型门户网站力不从心。<br><br><h3>02 - Joomla</h3>Joomla 是另一个备受推崇的 CMS 系统，它被广泛应用于企业网站和在线社区。Joomla 提供了众多的功能模块，如新闻发布、产品展示和用户管理等，让你的网站可以轻松满足各种需求。与 WordPress 相比，Joomla 的学习曲线稍微陡峭一些，但一旦熟悉了它的使用方法，你会发现它给你带来的丰富功能是无可替代的。<br><strong>缺点</strong>：Joomla 对于初学者来说并不如 WordPress 那样直观，学习难度系数比较大；可用附加组件更少；Joomla 社区比 WordPress 小，因此资源更容易少。<br><br><h3>03 - Drupal</h3>Drupal 是一款高度灵活的 CMS 系统，被广泛应用于大型企业和政府机构的网站。它提供了强大的权限管理和多语言支持，适合需要复杂功能和安全性的网站。尽管 Drupal 的学习曲线较陡峭，但一旦掌握了它的使用技巧，你将会被它的灵活性和扩展性所折服。<br><strong>缺点</strong>：没有一个默认易用的行为，每个站点都需要付出一定的工作量。<br><br><h3>04 - Discuz!</h3>Discuz! 是一款专注于社区建设的 CMS 系统，被广泛应用于论坛、社交网络和问答平台。它提供了丰富的社交功能，如用户管理、帖子发布和私信交流等。Discuz! 的用户群体庞大，拥有活跃的开发者社区，为你的社区网站提供了强大的支持和扩展能力。<br><strong>优点</strong>：完善的功能，易于使用，开源免费，插件扩展丰富。<br><strong>缺点</strong>：安全性问题，兼容性问题，技术支持，学习成本。<br><br><h3>05 - DedeCMS</h3>DedeCMS 是国内知名的 CMS 系统，广泛应用于个人博客和企业网站。它提供了简单易用的后台管理界面和丰富的模板资源。DedeCMS 还拥有强大的 SEO 优化功能，让你的网站能够在搜索引擎中获得更好的排名。无论你是个人创作者还是企业站长，DedeCMS 都能帮助你快速搭建出令人满意的网站。<br><strong>优点</strong>：社区资源丰富，模板丰富。<br><strong>缺点</strong>：安全性差，论坛付费，扩展性差，开始商业收费了！<br><br><h3>06 - PHPCMS</h3>PHPCMS 是一款强大的内容管理系统，广泛应用于企业门户和新闻网站。它提供了丰富的内容管理功能，如文章发布、评论管理和广告投放等。PHPCMS 的模板系统也非常灵活，让你可以轻松创建出独特的网站风格。如果你需要一个功能强大的网站，PHPCMS 绝对是一个值得考虑的选择。<br><strong>优点</strong>：模块化开发，便于扩展，界面美观。<br><strong>缺点</strong>：无技术支持，不适合新手；没有商城功能；采集功能较弱；已经不维护了。<br><br><h3>07 - MetInfo</h3>MetInfo 是一款专注于企业网站建设的 CMS 系统，提供了丰富的企业级功能和模板资源。它的后台管理界面简洁明了，让你可以轻松管理网站内容和用户信息。MetInfo 还拥有强大的 SEO 优化功能，帮助你的企业网站在竞争激烈的市场中脱颖而出。<br><strong>优点</strong>：内置免费版模板，20 多套界面风格，支持自定义模板。<br><strong>缺点</strong>：主题和插件少，商业收费主题相对多。<br><br><h3>08 - Typecho</h3>Typecho 是一款简洁高效的开源 CMS 系统，适合个人博客和小型网站的搭建。它提供了简单易用的后台管理界面和轻量级的代码结构，让你可以专注于内容创作而不用担心繁琐的技术细节。虽然 Typecho 的扩展性相对较弱，但对于需要一个简洁高效的博客平台来说，它是一个绝佳选择。<br><strong>优点</strong>：简单易用，文件体积较小，丰富的主题和插件，安全性较高，社区活跃。<br><strong>缺点</strong>：功能相对有限，文档相对不够完善，主题和插件相对较少，更新速度相对较慢。<br><br><h3>09 - ThinkCMF</h3>ThinkCMF 是一款全面的企业级 CMS 系统，提供了丰富的企业级功能和模板资源。它拥有强大的权限管理和多语言支持，适合大型企业和政府机构的网站建设。ThinkCMF 的后台管理界面直观易用，让你可以轻松管理网站内容和用户信息。<br><strong>优点</strong>：丰富的开发工具和模块，安全性较高，社区支持广泛。<br><strong>缺点</strong>：学习需要一定的时间和精力，文档不够完善，功能扩展有限，用户群体较小。<br><br><h3>10 - Z - Blog</h3>Z - Blog 是一款专注于个人博客的 CMS 系统，提供了简单易用的后台管理界面和丰富的主题资源。它的安装和配置非常简单，让你可以快速搭建个人博客并分享你的知识和经验。如果你是一个热爱写作的人，Z - Blog 绝对是一个值得尝试的选择。<br><strong>优点</strong>：开源免费，简单易用，丰富的功能模块，模板丰富，支持插件扩展。<br><strong>缺点</strong>：支持插件扩展，社区支持有限，模板和插件定制性相对较差。<br><br><h3>总结</h3>在本文中，我们向大家分享了十个火爆的 CMS 系统，每个 CMS 系统都有自己的特点和适用场景，你可以根据自己的需求选择最适合的系统来搭建出令人瞩目的网站。无论是个人博客、企业网站还是社区平台，这些 CMS 系统都能帮助你实现你的梦想！快来选择一个适合你的 CMS 系统，开始打造你的网站吧！'
    },
    {
        id: 4,
        title: "[博客_配置]",
        user: { login: 'imoki' }, // 假设用户名为 imoki
        // body: '{"avatar": "https://avatars.kkgithub.com/u/78804251?v=4", "name": "imoki", "bio": "热爱技术分享的开发者"}'
        body: '{"avatar": "https://avatars.kkgithub.com/u/78804251?v=4", "name": "imoki", "bio": "热爱技术分享的开发者", "articleImages": { "[博客_文章]Web 开发技术的前世今生": "https://img.loliapi.cn/i/pp/img86.webp", "[博客_文章]人工智能在医疗领域的应用与挑战": "https://img.loliapi.cn/i/pp/img51.webp", "[博客_文章]十大火爆的 CMS 系统推荐": "https://img.loliapi.cn/i/pp/img170.webp" }}'
    }
].filter(issue => issue.user && issue.user.login === username);

// 获取容器元素
const summariesContainer = document.getElementById('blog-summaries');
const detailContainer = document.getElementById('blog-detail');
// const searchInput = document.getElementById('search-input');
const avatarContainer = document.getElementById('avatar-container');
const personalInfoContainer = document.getElementById('personal-info');
// 获取首页导航项元素
const homeNav = document.getElementById('home-nav');

// 为首页导航项添加点击事件
homeNav.addEventListener('click', (e) => {
    e.preventDefault(); // 阻止默认的跳转行为
    summariesContainer.style.display = 'block';
    detailContainer.style.display = 'none';
    personalInfoContainer.style.display = 'block';
});

async function fetchData() {
    // 定义正则表达式，用于匹配 [博客_xxx] 格式的标题
    const regex = new RegExp(`^\\[${TYPE}_.*\\].*`);
    if (USE_MOCK_DATA) {
        // return mockIssues;
        // // 过滤模拟数据，只保留标题以 ARTICLE 开头的项
        // return mockIssues.filter(issue => issue.title.startsWith(ARTICLE));
        // 过滤模拟数据，只保留标题符合正则表达式的项
        return mockIssues.filter(issue => regex.test(issue.title));
    } else {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('网络响应失败');
            }
            // return await response.json();
            const data = await response.json();
            // // 过滤真实数据，只保留标题以 ARTICLE 开头的项
            // return data.filter(issue => issue.title.startsWith(ARTICLE));
            // 过滤真实数据，只保留标题符合正则表达式的项
            return data.filter(issue => regex.test(issue.title));
        } catch (error) {
            console.error('获取 GitHub Issues 时出错:', error);
            return [];
        }
    }
}

function renderPersonalInfo(issues) {
    // 检查容器元素是否存在
    if (!avatarContainer || !personalInfoContainer) {
        console.error('头像容器或个人信息容器未找到，请检查 HTML 中的元素 ID。');
        return;
    }
    // console.log(issues)
    // console.log(CONFIG)
    const configIssue = issues.find(issue => issue.title === CONFIG);
    if (configIssue) {
        try {
            const config = JSON.parse(configIssue.body);
            // 检查配置对象中是否包含所需属性
            if (config.avatar && config.name && config.bio) {
                const avatarImg = document.createElement('img');
                avatarImg.src = config.avatar;
                avatarImg.alt = '头像';
                avatarImg.className = 'avatar';
                avatarContainer.appendChild(avatarImg);

                const nameElement = document.createElement('h2');
                nameElement.textContent = config.name;
                const bioElement = document.createElement('p');
                bioElement.textContent = config.bio;

                personalInfoContainer.appendChild(nameElement);
                personalInfoContainer.appendChild(bioElement);
            } else {
                console.error('配置信息缺少必要字段，请检查 [配置] Issue 的内容。');
            }
            // 提取 articleImages 并赋值给 window.articleImages
            if (config.articleImages) {
                window.articleImages = config.articleImages;
            }
        } catch (error) {
            console.error('解析个人信息配置出错:', error);
        }
    }
}

async function init() {
    const issues = await fetchData();
    renderPersonalInfo(issues);
    const articleIssues = issues.filter(issue => issue.title !== CONFIG);
    renderSummaries(articleIssues);

    // searchInput.addEventListener('input', function () {
    //     const keyword = this.value.toLowerCase();
    //     const filteredIssues = articleIssues.filter(issue =>
    //         issue.title.toLowerCase().includes(keyword) || issue.body.toLowerCase().includes(keyword)
    //     );
    //     renderSummaries(filteredIssues);
    // });
}

function renderSummaries_noimage(issues) {
    summariesContainer.innerHTML = '';
    issues.forEach(issue => {
        // 创建文章概要元素
        const summaryElement = document.createElement('div');
        summaryElement.classList.add('blog-summary');

        // 创建文章标题元素
        const titleElement = document.createElement('h2');
        // 去掉 ARTICLE 标识
        const cleanTitle = issue.title.replace(ARTICLE, '').trim();
        titleElement.textContent = cleanTitle;
        titleElement.addEventListener('click', () => showDetail(issue));

        // 创建文章概要内容元素
        const summaryContent = document.createElement('p');
        // 截取前 指定 个字符作为概要
        const summaryText = issue.body.substring(0, ARTICLE_ABSTRACT_NUM) + '...';
        summaryContent.innerHTML = marked.parse(summaryText);

        // 将标题和概要添加到文章概要容器
        summaryElement.appendChild(titleElement);
        summaryElement.appendChild(summaryContent);

        // 将文章概要容器添加到博客文章概要容器
        summariesContainer.appendChild(summaryElement);
    });
}

function renderSummaries(issues) {
    summariesContainer.innerHTML = '';
    issues.forEach((issue, index) => {
        // 创建文章概要元素
        const summaryElement = document.createElement('div');
        summaryElement.classList.add('blog-summary');
        // 使用 Flexbox 布局
        summaryElement.style.display = 'flex'; 
        summaryElement.style.alignItems = 'center'; 
        summaryElement.style.justifyContent = 'space-between'; 
        summaryElement.style.gap = '20px'; // 设置图片和文本之间的间距

        // 创建文章标题和内容容器
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');
        // 让文本容器可以弹性增长
        textContainer.style.flex = 1; 

        // 创建文章图片元素
        if (window.articleImages && window.articleImages[issue.title]) {
            const imgElement = document.createElement('img');
            imgElement.src = window.articleImages[issue.title];
            imgElement.alt = issue.title;
            // 限制图片最大宽度和高度
            imgElement.style.maxWidth = '30%'; 
            imgElement.style.maxHeight = '200px'; 
            imgElement.style.objectFit = 'cover'; 

            // 根据索引判断图片显示位置
            if (index % 2 === 0) {
                imgElement.classList.add('left-image');
                summaryElement.prepend(imgElement); // 将图片添加到容器开头
            } else {
                imgElement.classList.add('right-image');
                summaryElement.appendChild(imgElement);
            }
        }

        // 创建文章标题元素
        const titleElement = document.createElement('h2');
        // 去掉 ARTICLE 标识
        const cleanTitle = issue.title.replace(ARTICLE, '').trim();
        titleElement.textContent = cleanTitle;
        titleElement.addEventListener('click', () => showDetail(issue));

        // 创建文章概要内容元素
        const summaryContent = document.createElement('p');
        // 截取前 指定 个字符作为概要
        const summaryText = issue.body.substring(0, ARTICLE_ABSTRACT_NUM) + '...';
        summaryContent.innerHTML = marked.parse(summaryText);

        // 将标题和概要添加到文本容器
        textContainer.appendChild(titleElement);
        textContainer.appendChild(summaryContent);

        // 将文本容器添加到文章概要容器
        summaryElement.appendChild(textContainer);

        // 将文章概要容器添加到博客文章概要容器
        summariesContainer.appendChild(summaryElement);
    });
}

// 显示文章详情
function showDetail(issue) {
    // 隐藏文章概要
    summariesContainer.style.display = 'none';
    // 隐藏个人信息
    personalInfoContainer.style.display = 'none';
    // 显示文章详情
    detailContainer.style.display = 'block';

    // 清空之前的详情内容
    detailContainer.innerHTML = '';

    // 创建文章标题元素
    const titleElement = document.createElement('h1');
    // 去掉 ARTICLE 标识
    const cleanTitle = issue.title.replace(ARTICLE, '').trim();
    titleElement.textContent = cleanTitle;

    // 创建文章内容元素
    const contentElement = document.createElement('div');
    contentElement.innerHTML = marked.parse(issue.body);

    // 创建返回按钮
    const backButton = document.createElement('button');
    backButton.textContent = '返回';
    backButton.addEventListener('click', () => {
        summariesContainer.style.display = 'block';
        detailContainer.style.display = 'none';
        // 如果是从个人信息页面返回，显示个人信息
        personalInfoContainer.style.display = 'block';
    });

    // 将元素添加到详情容器
    detailContainer.appendChild(backButton);
    detailContainer.appendChild(titleElement);
    detailContainer.appendChild(contentElement);
}
init();
