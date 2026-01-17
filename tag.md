---
layout: page
title: Tags
permalink: /tag
---


<h1 class="page-title" id="tags">标签</h1>

<div class="archive-main" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
  {% assign tags_list = site.tags %}
  {% if tags_list.first[0] == null %}
    {% for tag in tags_list %}
      {% assign tags = tag | split: "," %}
      {% for tag in tags %}
        <a href="#{{ tag | slugify }}" class="tag">{{ tag }}</a>
      {% endfor %}
    {% endfor %}
  {% else %}
    {% for tag in tags_list %}
      <a href="#{{ tag[0] | slugify }}" class="tag">{{ tag[0] }}</a>
    {% endfor %}
  {% endif %}
</div>

<div class="archive-main">
  {% assign tags_list = site.tags %}
  {% if tags_list.first[0] == null %}
    {% for tag in tags_list %}
      {% assign tags = tag | split: "," %}
      {% for tag in tags %}
        <h3 id="{{ tag | slugify }}">{{ tag }}</h3>
        <div>
          {% for post in site.posts %}
            {% if post.tags contains tag %}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <a href="{{ post.url | relative_url }}" style="font-size: 1.3rem;">{{ post.title }}</a>
              <span style="color: #999; font-size: 1rem; white-space: nowrap;">{{ post.date | date: "%Y-%m-%d" }}</span>
            </div>
            {% endif %}
          {% endfor %}
        </div>
      {% endfor %}
    {% endfor %}
  {% else %}
    {% for tag in tags_list %}
      <h3 id="{{ tag[0] | slugify }}">{{ tag[0] }}</h3>
      <div>
        {% for post in site.posts %}
          {% if post.tags contains tag[0] %}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <a href="{{ post.url | relative_url }}" style="font-size: 1.3rem;">{{ post.title }}</a>
            <span style="color: #999; font-size: 1rem; white-space: nowrap;">{{ post.date | date: "%Y-%m-%d" }}</span>
          </div>
          {% endif %}
        {% endfor %}
      </div>
    {% endfor %}
  {% endif %}
</div>