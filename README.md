# SPRX Marquee

A lightweight, vanilla JavaScript marquee component that creates smooth scrolling animations with automatic viewport pausing.

## Installation

Add the script to your HTML file:

```html
<script src="path/to/sprx-marquee.js"></script>
```

Or include it inline in a `<script>` tag at the end of your `<body>`.

## Usage

### Basic HTML Structure

```html
<div data-sprx-marquee>
  <div data-sprx-marquee-list>
    <span>Item 1</span>
    <span>Item 2</span>
    <span>Item 3</span>
  </div>
</div>
```

The script will automatically duplicate the list based on your configuration.

### Configuration Attributes

Add these attributes to the `[data-sprx-marquee]` element:

#### `data-instances`
Number of list duplicates to create (default: `2`).

```html
<div data-sprx-marquee data-instances="3">
```

#### `data-speed`
Scroll speed in pixels per second (default: `75`).

```html
<div data-sprx-marquee data-speed="100">
```

#### `data-direction`
Animation direction. Use `"reverse"` for right-to-left scrolling (default: left-to-right).

```html
<div data-sprx-marquee data-direction="reverse">
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marquee Demo</title>
  <style>
    [data-sprx-marquee] {
      display: flex;
      overflow: hidden;
      gap: 2rem;
    }
    [data-sprx-marquee-list] {
      display: flex;
      gap: 2rem;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div data-sprx-marquee data-speed="100" data-instances="3">
    <div data-sprx-marquee-list>
      <span>🚀 Feature 1</span>
      <span>⚡ Feature 2</span>
      <span>🎨 Feature 3</span>
    </div>
  </div>

  <script src="sprx-marquee.js"></script>
</body>
</html>
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
