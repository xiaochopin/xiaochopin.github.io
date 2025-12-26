---
layout: post
title: 使用GithubActions自动推送文章到“笔墨迹”
tags: [技术]
date: 2025-12-26 18:40:00 +0800
---

>[“笔墨迹”](https://blogscn.fun)是一个位于中国境内的平台，致力于发掘和分享“优秀个人独立博客”。

WordPress和Typecho可以使用插件推送，而使用Github Pages的部署的静态博客可以通过Github Actions使用api推送。

我们以jekyll为例，修改`.github
/workflows/jekyll.yml`，添加以下内容：

```
  notify:
    name: Ping blogscn aggregator
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Trigger ping webhook
        run: curl -sSf "https://blogscn.fun/blogs/api/ping?rss=你的RSS地址"
```
