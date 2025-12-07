---
title: Home
layout: page
---
<div class="page-title" id="latest-posts">最新最热</div>
<div class="archive-main">
  {% for post in site.posts limit:6 %}
    <div class="archive-item">
      <div class="archive-date">
        {{ post.date | date:"%B %d, %Y" }}
        {% if post.tags %}
          {% for tag in post.tags %}
            <span class="archive-tag">#{{ tag }}</span>
          {% endfor %}
        {% endif %}
      </div>
      <div class="archive-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></div>
    </div>
  {% endfor %}
</div>
<p class="archive-more">
  <a href="{{ "/archive" | relative_url }}">查看存档</a>
</p>
