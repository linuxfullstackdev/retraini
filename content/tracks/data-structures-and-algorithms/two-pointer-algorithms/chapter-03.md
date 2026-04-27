---
title: "Chapter 3 — Removing Duplicates from Sorted Arrays"
date: 2026-01-23
draft: false
type: "chapters"

order: 3
estimatedMinutes: 14
summary: "The classic in-place dedupe problem solved with the read/write two-pointer variant."
tags: ["two-pointer", "in-place"]

description: "Solve the classic remove-duplicates-from-sorted-array problem in O(n) time and O(1) space using a read/write pair of pointers."
keywords: ["two pointer", "in-place", "dedupe", "sorted arrays"]
author: "Tech Tutorials Team"
ogImage: "/images/og-default.png"
ogType: "article"
twitterCard: "summary_large_image"

theme: "lavender"
---

## The problem

Given a sorted array, modify it in place so that each element appears at most
once and return the new length.

```python
def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[read - 1]:
            nums[write] = nums[read]
            write += 1
    return write
```

{{< code-tabs >}}
{{< code-tab lang="python" title="Python" >}}
```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```
{{< /code-tab >}}

{{< code-tab lang="java" title="Java" >}}
```java
class Fib {
    static int fib(int n) {
        return n < 2 ? n : fib(n - 1) + fib(n - 2);
    }
}
```
{{< /code-tab >}}

{{< code-tab lang="golang" title="Golang" >}}
```golang
func fib(n int) int {
    if n < 2 { return n }
    return fib(n-1) + fib(n-2)
}
```
{{< /code-tab >}}

{{< code-tab lang="rust" title="Rust" >}}
```rust
fn fib(n: u32) -> u32 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}
```
{{< /code-tab >}}

{{< code-tab lang="php" title="PHP" >}}
```php
function fib(int $n): int {
    return $n < 2 ? $n : fib($n - 1) + fib($n - 2);
}
```
{{< /code-tab >}}

{{< code-tab lang="node" title="Node.js" >}}
```javascript
function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
module.exports = { fib };
```
{{< /code-tab >}}

{{< code-tab lang="javascript" title="JavaScript" >}}
```javascript
export const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
```
{{< /code-tab >}}
{{< /code-tabs >}}


{{< code-tabs >}}
{{< code-tab title="Python" >}}
```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```
{{< /code-tab >}}
{{< /code-tabs >}}

This is the *read/write* variant of two pointers — one pointer scans the
input while the other tracks where to write the next unique element.

<!-- Inline ad slot. -->
{{< ad slot="chapter-inline-1" size="responsive" >}}

## Where to next?

You've finished a complete worked example using the two-pointer pattern.
Continue to the next course in this track to see how the same idea
generalizes to sliding windows.
