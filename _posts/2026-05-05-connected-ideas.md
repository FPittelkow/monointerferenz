---
layout: post
categories: Generative Computational
# date: 2026-05-05 Europe/Brussel
short_description: Interactive generative sketch where ideas drift, connect, and dissolve into a moving network.
featured: true
tags: code experimantal
image_preview: /assets/images/thumbnails/connected-ideas.png
title: Connected Ideas
permalink: /connected-ideas
---

**Drag left to decrease or right to increase the number of Ideas.**
<iframe
  scrolling="no"
  style="overflow:hidden"
  width="100%"
  height="800"
  src="{{ "/assets/support/connected/connected.html" | relative_url }}">
</iframe>

## Statement & Description
Each dot embodies a singular thought, traversing a defined yet fluid space where art meets algorithm. As these thoughts journey across the canvas, their paths are shaped by both chance and computational precision. When two thoughts come close, a bond form a luminous line whose brightness reflects their proximity, serving as a technical display of their conceptual connection. 


Over time, these interactions gradually form a dynamic network, an evolving structure that mirrors the delicate balance between randomness and order. This project is a digital tapestry, where the interplay of light and motion reveals the intricate, measurable dance of ideas.


## Inspiration
- <a href="https://en.wikipedia.org/wiki/Cloud_chamber" target="_blank">Cloud chamber</a>
- <a href="https://en.wikipedia.org/wiki/Photo_51" target="_blank">Photo 51</a>


## Technical Description
The visualization begins by setting up a drawing area and dynamically creating a collection of nodes based on an initial default value. The number of nodes can be adjusted on the fly using a horizontal drag gesture dragging right increases the node count while dragging left decreases it. Each node is randomly positioned within the canvas and is assigned a random speed and direction.


In every cycle, the program overlays a nearly transparent black layer across the entire drawing area. This fading effect causes previous frames to gradually disappear, creating motion trails behind the moving nodes.


Next, the program computes the distance between every pair of nodes. If two nodes are close enough, it draws a line connecting them, with the line’s brightness increasing as the distance between the nodes decreases. After rendering these connections, each node’s position is updated according to its velocity. If a node reaches the edge of the drawing area, it bounces back by reversing its direction.


Finally, the program continuously monitors horizontal drag gestures. When such a gesture is detected, nodes are either added or removed dynamically ensuring the visualization reflects the user’s current interaction in real time.

### Tools
- <a href="https://p5js.org" target="_blank">p5.js</a>
