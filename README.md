# SPRX Marquee

A lightweight, vanilla JavaScript marquee component that creates smooth scrolling animations with automatic viewport pausing.

## Installation

Add the script via jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/sparx-agency/sprx-marquee@latest/index.js"></script>
```

## Usage

### Basic HTML Structure

```html
<div data-sprx-marquee>
  <div data-sprx-marquee-list>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>
</div>
```

The script will automatically duplicate the list based on your configuration.

### Configuration Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-instances` | Number | `2` | Number of list duplicates to create |
| `data-speed` | Number | `75` | Scroll speed in pixels per second |
| `data-direction` | String | `normal` | Animation direction. Use `"reverse"` for right-to-left |
| `data-pausable` | String | `false` | Set to `"true"` to pause animation on hover |

### Examples

```html
<!-- Fast scrolling with 3 instances -->
<div data-sprx-marquee data-speed="150" data-instances="3">
  <div data-sprx-marquee-list>
    <div>Item 1</div>
    <div>Item 2</div>
  </div>
</div>

<!-- Reverse direction with pause on hover -->
<div data-sprx-marquee data-direction="reverse" data-pausable="true">
  <div data-sprx-marquee-list>
    <div>Item 1</div>
    <div>Item 2</div>
  </div>
</div>
```

## Features

- **Auto-initialization**: Runs automatically on page load
- **Viewport pausing**: Animation pauses when scrolled out of view
- **Smooth performance**: Uses CSS transforms and `will-change`
- **Flexible configuration**: Control speed, direction, and instances
- **Zero dependencies**: Pure vanilla JavaScript

## Browser Support

Works in all modern browsers that support:
- CSS animations
- Intersection Observer API
- ES6+ JavaScript
