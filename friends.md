---
title: Friends
layout: page
permalink: /friends
---

<div class="page-title">小伙伴们</div>

这里是我的朋友们的网站，欢迎互换友链~

<div class="things">
{% for friend in site.data.friends %}
  <div class="things-item">
    <div class="things-avatar">
      <img src="{{ friend.img }}" alt="{{ friend.title }}" />
    </div>
    <div class="things-info">
      <div class="things-title">
        <a href="{{ friend.link }}" target="_blank" rel="noopener noreferrer">{{ friend.title }}</a>
          {% if friend.name %}
          <span class="things-subtitle">——{{ friend.name }}</span>
          {% endif %}
      </div>
      <div class="things-list">
        <div>{{ friend.desc }}</div>
      </div>
    </div>
  </div>
{% endfor %}
</div>


<script src="/assets/scripts/things-shuffle.js"></script>

#### 如何添加友链

你需要提供以下信息发送到我的邮箱进行申请（邮箱地址请见页脚或下方本站信息）。

提交申请前，请确认贵站已添加本站友链。

```
- title: 站点名称
  name: 博主名称
  img: 头像或logo链接
  desc: 简介
  link: 站点链接
```

#### 本站信息

```
头像：https://cn.cravatar.com/avatar/a10109bb266cc4eebc8d7992a4977a0c?s=200
站点名称：重生云
站点链接：xiaochopin.github.io
简介：明月装饰了你的窗，你装饰了别人的梦。
邮箱：xiaochopin@foxmail.com
```