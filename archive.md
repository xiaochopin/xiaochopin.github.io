---
title: Archive
layout: page
permalink: /archive
---

<div class="page-title" id="archive">存档</div>
<div class="archive-main">
  {% for post in site.posts %}
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
