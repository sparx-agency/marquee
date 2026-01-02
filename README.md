SPRX Marquee

A lightweight, attribute-driven marquee system using CSS animations and IntersectionObserver.
No configuration needed beyond HTML data attributes.

Basic HTML Structure
<div
  data-sprx-marquee
  data-speed="75"
  data-direction="normal"
  data-instances="2"
>
  <div data-sprx-marquee-list>
    <!-- marquee content -->
  </div>
</div>

Structure notes

data-sprx-marquee
Root container for one marquee instance.

data-sprx-marquee-list
The scrolling content. This element is animated and cloned automatically.

Multiple marquee instances on the same page are fully supported.

Attribute Reference
Marquee Container Attributes
Attribute	Type	Default	Description
data-sprx-marquee	boolean	required	Initializes a marquee instance. Applied to the container element.
data-speed	number	75	Scroll speed in pixels per second. Higher values move faster.
data-direction	string	normal	Scroll direction. Accepts normal or reverse.
data-instances	number	2	Total number of marquee lists including the original. Controls seamless looping.
Marquee List Attributes
Attribute	Type	Default	Description
data-sprx-marquee-list	boolean	required	Marks an element as a scrolling marquee list. This element is animated and cloned.
Attribute Behavior Details
data-speed
<div data-sprx-marquee data-speed="100">


Value represents pixels per second

Animation duration is calculated dynamically per list

Formula used internally:

duration = list width ÷ pixels per second

data-direction
<div data-sprx-marquee data-direction="reverse">


Supported values:

Value	Behavior
normal	Scrolls left
reverse	Scrolls right

Direction is applied using CSS animation-direction.

data-instances
<div data-sprx-marquee data-instances="3">


Controls how many total marquee lists exist.

Value	Result
1	Original list only
2	1 cloned list
3	2 cloned lists

This ensures continuous scrolling even with short content.

Visibility Behavior
Feature	Description
Auto pause	Animation pauses when the marquee leaves the viewport
Auto resume	Animation resumes when the marquee re-enters the viewport
Implementation	Uses IntersectionObserver
Configuration	Always enabled, no attribute required
Minimal Example
<div
  data-sprx-marquee
  data-speed="90"
  data-direction="reverse"
  data-instances="2"
>
  <div data-sprx-marquee-list>
    <span>Logo A</span>
    <span>Logo B</span>
    <span>Logo C</span>
  </div>
</div>

Notes

CSS keyframes are injected automatically once per page

Each marquee instance is calculated independently

Works with flex, grid, or inline layouts

No JavaScript configuration required
