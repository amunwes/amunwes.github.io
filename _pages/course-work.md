---
layout: archive
title: "Course Work"
permalink: /course-work/
author_profile: true
---





Welcome to my course work page!
This is where I plan to share some my academic experiences. 
I plan to fill out the accompanying posts here with course descriptions and syllabus' as well as 
final grades and my personal opinions of the experiences.

{% for post in site.course-work %}
  {% include archive-single.html %}
{% endfor %}
