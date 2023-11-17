---
layout: archive
title: "Blog Posts"
permalink: /blog/
author_profile: true
---


Just a space for blog posts

<h1>Latest Posts</h1>

<ul>
  {% for post in site.posts %}
    <li>
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
    </li>
  {% endfor %}
</ul>
