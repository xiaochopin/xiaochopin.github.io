---
title: Friends
layout: page
permalink: /friends
---

<div class="page-title">小伙伴们</div>

这里是我的朋友们的网站，欢迎互换友链~

<div class="things">
  <!-- 友链将通过JavaScript自动渲染 -->
</div>

<script type="module">
function renderFriends(data) {
  const container = document.querySelector('.things');
  
  if (!container) {
    console.error('未找到友链容器');
    return;
  }

  const html = data.map(item => `
    <div class="things-item">
      <div class="things-avatar">
        <img src="${item.img}" alt="${item.title}"/>
      </div>
      <div class="things-info">
        <div class="things-title">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
          <span class="things-subtitle">——${item.name}</span>
        </div>
        <div class="things-list">
          <div>${item.desc}</div>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 友链数据 - 在这里添加或删除友链，按照以下格式：
const friendsData = [
  {
    title: '望月阁',
    name: '等风',
    img: 'https://233.194901.xyz/avatar/avatar02.png',
    desc: '给岁月以文明，给文明以岁月',
    link: 'https://233.194901.xyz/',
  },
  {
    title: '路明笔记',
    name: 'Riseforever',
    img: 'https://cn.cravatar.com/avatar/302380667bdaf4e1390800e62494d4af?s=500&r=X',
    desc: '不慌张，不绝望，不狂妄，不投降',
    link: 'https://luming.cool',
  },
  
  // === 友链格式 ===
  // {
  //   title: '站点名称',
  //   img: '站点头像URL',
  //   desc: '一句话简介',
  //   link: '站点链接',
  // },
];

// 页面加载完成后渲染友链
document.addEventListener('DOMContentLoaded', function() {
  if (typeof renderFriends === 'function') {
    renderFriends(friendsData);
  } else {
    console.error('renderFriends函数未定义');
  }
});
</script>

#### 如何添加友链

你需要提供以下信息发送到我的邮箱进行申请（邮箱地址请见页脚或下方本站信息）。

提交申请前，请确认贵站已添加本站友链。

```
{
  title: '站点名称',
  name: '博主名称',
  img: '头像',
  desc: '简介',
  link: '站点链接',
},
```

#### 本站信息

```
头像：https://cn.cravatar.com/avatar/a10109bb266cc4eebc8d7992a4977a0c?s=200
站点名称：重生云
站点链接：xiaochopin.github.io
简介：明月装饰了你的窗，你装饰了别人的梦。
邮箱：xiaochopin@foxmail.com
```