---
title: "Opposite Direction Pointers"
date: 2026-04-27T10:01:00+05:30
draft: false
type: "chapters"
weight: 1
order: 1

estimatedMinutes: 15
summary: "Two pointers start from opposite ends and move inward, commonly used for pair sum and container problems."

tags: ["two pointers"]

description: "Learn opposite direction two pointers with problems like two sum sorted, container with most water, and trapping rain water."
keywords: ["chapter", "two pointers", "opposite direction pointers"]

author: "Retraini Trainer"
canonical: ""
ogImage: "/images/og-default.png"
ogType: "article"
twitterCard: "summary_large_image"

theme: "lavender"
---

## Introduction

Welcome to the chapter on Opposite Direction Pointers in Two Pointer Algorithms. This chapter will guide you through the concept, use cases, and implementation of opposite direction pointers.

Opposite Direction Pointers are a technique used in solving problems where two pointers move towards each other to efficiently achieve a specific goal.

## Key applications
- Two Sum : Finding pairs in a sorted array that sum to a specific target.
- Three sum problem using two pointers.
- Four sum problem using two pointers.
- Solving the container with most water problem using two pointers.
- Solving the trapping rain water problem using two pointers.
- Determining if a string is a palindrome using two pointers.
- Merging two sorted arrays into a single sorted array using two pointers.
- Finding the intersection of two sorted arrays using two pointers.
- Solving the maximum area of a piece of cake problem using two pointers.

### Container with most water
Imagine you are given an array of integers, where each integer represents the height of a vertical line at that index. The distance between each index is 1. You need to find two lines that, together with the x-axis, form a container that holds the most water.

**The Constraints**
1. Height of the container: Limited by the shorter of the two lines. If one line is height 8 and the other is height 3, water will overflow if you go above 3.
2. Width of the container: The distance between the two indices ($j - i$).
3. The Goal: Maximize the Area. 
4. Formula: The area is calculated as the product of the minimum height of the two lines and the distance between them. 
	```$Area = min(height[i], height[j]) x (j - i)```.
We all know area of rectangle is Length multiplied by Width

**Lets Visualize**

<style>
  .algo-container {
    --vis-blue: #4a9eff;
    --vis-teal: #2dd4a0;
    width: 100%;
    max-width: var(--content-max);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin: 2rem 0;
    font-family: var(--font-mono);
  }

  .algo-vis-svg { display: block; width: 100%; height: auto; }
  
  /* Text colors follow theme */
  .algo-text-main { fill: var(--c-text); }
  .algo-text-muted { fill: var(--c-text-soft); }
  .algo-bar-default { fill: var(--c-border-strong); opacity: 0.5; }

  .algo-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .algo-btn {
    background: var(--c-bg);
    border: 1px solid var(--c-border-strong);
    border-radius: 6px;
    color: var(--c-text-strong);
    font-size: 12px;
    padding: 6px 14px;
    cursor: pointer;
  }
  .algo-btn:hover:not(:disabled) { border-color: var(--c-accent); color: var(--c-accent); }
  .algo-btn:disabled { opacity: 0.3; cursor: default; }

  .algo-info {
    margin-top: 1rem;
    background: var(--c-bg-soft);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    font-size: 13px;
    color: var(--c-text);
    min-height: 45px;
    line-height: 1.5;
  }
  .algo-highlight { color: var(--vis-blue); font-weight: 600; }
  .algo-best { color: var(--vis-teal); font-weight: 600; }

  .algo-legend {
    display: flex;
    gap: 1.2rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .algo-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--c-text-soft); }
  .algo-dot { width: 10px; height: 10px; border-radius: 2px; }
</style>

<div class="algo-container">
  <div class="eyebrow">Interactive Demo</div>
  <h3 style="margin-bottom:1rem;">Container With Most Water</h3>

  <svg id="vis" class="algo-vis-svg" viewBox="0 0 680 300">
    <g id="water-fill"></g>
    <g id="bars"></g>
    <g id="pointers"></g>
    <g id="area-label"></g>
  </svg>

  <div class="algo-controls">
    <button class="algo-btn" id="prevBtn" onclick="step(-1)">← Prev</button>
    <button class="algo-btn" id="nextBtn" onclick="step(1)">Next →</button>
    <button class="algo-btn" onclick="reset()">Reset</button>
    <span class="small muted" id="step-label" style="margin-left:auto;"></span>
  </div>

  <div class="algo-info" id="info"></div>

  <div class="algo-legend">
    <div class="algo-legend-item"><div class="algo-dot" style="background:var(--vis-blue)"></div> Pointers</div>
    <div class="algo-legend-item"><div class="algo-dot" style="background:var(--vis-teal)"></div> Best Area</div>
    <div class="algo-legend-item"><div class="algo-dot" style="background:var(--vis-blue); opacity:0.2"></div> Water</div>
  </div>
</div>

<script>
(function() {
  const heights = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  const N = heights.length;
  const W = 680, H = 300;
  const PAD_L = 36, PAD_R = 36, PAD_TOP = 28, PAD_BOT = 52;
  const chartW = W - PAD_L - PAD_R, chartH = H - PAD_TOP - PAD_BOT;
  const barW = chartW / N, maxH = Math.max(...heights);

  let cur = 0;
  const steps = (function() {
    let l = 0, r = N - 1, best = 0, bestL = 0, bestR = N - 1;
    const s = [{ l, r, action: 'start', area: null, best, bestL, bestR }];
    while (l < r) {
      const area = Math.min(heights[l], heights[r]) * (r - l);
      if (area > best) { best = area; bestL = l; bestR = r; }
      s.push({ l, r, area, best, bestL, bestR });
      if (heights[l] <= heights[r]) l++; else r--;
    }
    s.push({ l, r, area: null, best, bestL, bestR, done: true });
    return s;
  })();

  function render() {
    const s = steps[cur];
    const barsG = document.getElementById('bars');
    const waterG = document.getElementById('water-fill');
    const ptrsG  = document.getElementById('pointers');
    const lblG   = document.getElementById('area-label');

    barsG.innerHTML = waterG.innerHTML = ptrsG.innerHTML = lblG.innerHTML = '';

    heights.forEach((h, i) => {
      const x = barX(i), y = barY(h), bh = (h / maxH) * chartH;
      const isActive = !s.done && (i === s.l || i === s.r);
      const isBest = s.done && (i === s.bestL || i === s.bestR);
      
      const fill = isBest ? 'var(--vis-teal)' : isActive ? 'var(--vis-blue)' : 'var(--c-border-strong)';
      const opacity = (isActive || isBest) ? '1' : '0.4';

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      Object.entries({x: x+4, y, width: barW-8, height: bh, fill, opacity, rx: 4}).forEach(([k,v]) => rect.setAttribute(k,v));
      barsG.appendChild(rect);
    });

    if (s.area !== null || s.done) {
      const L = s.done ? s.bestL : s.l;
      const R = s.done ? s.bestR : s.r;
      const waterH = (Math.min(heights[L], heights[R]) / maxH) * chartH;
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      Object.entries({
        x: barX(L) + barW/2, y: PAD_TOP + chartH - waterH, 
        width: barX(R) - barX(L), height: waterH,
        fill: s.done ? 'var(--vis-teal)' : 'var(--vis-blue)', opacity: 0.15
      }).forEach(([k,v]) => rect.setAttribute(k,v));
      waterG.appendChild(rect);
    }

    const info = document.getElementById('info');
    if (s.done) {
      info.innerHTML = `<span class="algo-best">Final Result:</span> The maximum area found is <strong>${s.best}</strong> units.`;
    } else {
      info.innerHTML = `L=${s.l}, R=${s.r} | Area: <span class="algo-highlight">${s.area || '...'}</span>`;
    }

    document.getElementById('step-label').textContent = `${cur} / ${steps.length-1}`;
    document.getElementById('prevBtn').disabled = cur === 0;
    document.getElementById('nextBtn').disabled = cur === steps.length-1;
  }

  function barY(h) { return PAD_TOP + chartH - (h / maxH) * chartH; }
  function barX(i) { return PAD_L + i * barW; }
  window.step = (d) => { cur = Math.max(0, Math.min(steps.length-1, cur+d)); render(); };
  window.reset = () => { cur = 0; render(); };
  render();
})();
</script>

{{< code-tabs >}}
{{< code-tab lang="python" title="Python" >}}
```python
def maxArea(height):
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate width
        width = right - left
        
        # Calculate current area (min height * width)
        current_height = min(height[left], height[right])
        current_area = current_height * width
        
        # Update the global maximum
        max_water = max(max_water, current_area)
        
        # Move the pointer pointing to the shorter line
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
            
    return max_water
```
{{< /code-tab >}}

{{< code-tab lang="java" title="Java" >}}
```java
class Solution {
    public int maxArea(int[] height) {
        int maxWater = 0;
        int left = 0;
        int right = height.length - 1;

        while (left < right) {
            // Calculate width and the limiting height
            int width = right - left;
            int currentHeight = Math.min(height[left], height[right]);
            
            // Update max area if current is larger
            maxWater = Math.max(maxWater, width * currentHeight);

            // Move the pointer that points to the shorter line
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxWater;
    }
}
```
{{< /code-tab >}}

{{< code-tab lang="golang" title="Golang" >}}
```go
func maxArea(height []int) int {
    maxWater := 0
    left, right := 0, len(height)-1

    for left < right {
        width := right - left
        h := 0
        
        // Standard manual min/max logic since Go 
        // math.Min takes float64s
        if height[left] < height[right] {
            h = height[left]
            left++
        } else {
            h = height[right]
            right--
        }
        
        area := width * h
        if area > maxWater {
            maxWater = area
        }
    }
    return maxWater
}
```
{{< /code-tab >}}

{{< code-tab lang="rust" title="Rust" >}}
```rust
impl Solution {
    pub fn max_area(height: Vec<i32>) -> i32 {
        let mut max_water = 0;
        let mut left = 0;
        let mut right = height.len() - 1;

        while left < right {
            let width = (right - left) as i32;
            // Get the minimum height between the two pointers
            let h = height[left].min(height[right]);
            
            // Compare and store the maximum area
            max_water = max_water.max(width * h);

            // Advance the pointer that is currently the bottleneck
            if height[left] < height[right] {
                left += 1;
            } else {
                right -= 1;
            }
        }
        max_water
    }
}
```
{{< /code-tab >}}

{{< code-tab lang="php" title="PHP" >}}
```php
class Solution {
    /**
     * @param Integer[] $height
     * @return Integer
     */
    function maxArea($height) {
        $maxWater = 0;
        $left = 0;
        $right = count($height) - 1;

        while ($left < $right) {
            $width = $right - $left;
            // The height of the water is limited by the shorter bar
            $h = min($height[$left], $height[$right]);
            
            $maxWater = max($maxWater, $width * $h);

            // Move the pointer pointing to the shorter vertical line
            if ($height[$left] < $height[$right]) {
                $left++;
            } else {
                $right--;
            }
        }
        return $maxWater;
    }
}
```
{{< /code-tab >}}


{{< code-tab lang="javascript" title="JavaScript" >}}
```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    let maxWater = 0;
    let left = 0;
    let right = height.length - 1;

    while (left < right) {
        const width = right - left;
        // Use Math.min to find the shorter wall
        const currentArea = width * Math.min(height[left], height[right]);
        
        // Update the global maximum
        maxWater = Math.max(maxWater, currentArea);

        // Shift the pointer of the shorter wall to seek a taller one
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    return maxWater;
};
```
{{< /code-tab >}}
{{< /code-tabs >}}

	
