---
title: 拾珍集
layout: page
permalink: /favlist
---

<h1 class="page-title">常看常新</h1>

一些自己比较喜欢的站点。

<div class="things things-hidden">
{% for fav in site.data.fav %}
  <div class="things-item">
    <div class="things-avatar">
      <img src="{{ fav.img }}" alt="{{ fav.title }}" />
    </div>
    <div class="things-info">
      <div class="things-title">
        <a href="{{ fav.link }}" target="_blank" rel="noopener noreferrer">{{ fav.title }}</a>
          {% if fav.name %}
          <span class="things-subtitle">——{{ fav.name }}</span>
          {% endif %}
      </div>
      <div class="things-list">
        <div>{{ fav.desc }}</div>
      </div>
    </div>
  </div>
{% endfor %}
</div>