---
title: "Chapter 2 — Reversing & Palindromes"
date: 2026-01-22
draft: false
type: "chapters"

order: 2
estimatedMinutes: 10
summary: "Apply two pointers to strings: reversal in place and palindrome checking."
tags: ["two-pointer", "strings"]

description: "Use two pointers to reverse strings in place and to check whether a string is a palindrome in O(n) time."
keywords: ["two pointer", "strings", "palindrome"]
author: "Tech Tutorials Team"
ogImage: "/images/og-default.png"
ogType: "article"
twitterCard: "summary_large_image"

theme: "lavender"
---

## Reversing a string in place

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris non tortor
a turpis fermentum porta.

```python
def reverse_in_place(chars):
    left, right = 0, len(chars) - 1
    while left < right:
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
```

<!-- Mid-content ad slot. -->
{{< ad slot="chapter-inline-1" size="responsive" >}}

## Palindromes

A palindrome reads the same forwards and backwards. Use two pointers from
both ends and compare as you walk inward.

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
```

Don't forget to mark this chapter complete when you're done.
