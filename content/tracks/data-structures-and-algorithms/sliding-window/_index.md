---
# -----------------------------------------------------------------------------
# Course archetype — a course belongs to a track.
# Place at: content/tracks/<track-slug>/<course-slug>/_index.md
# A course contains multiple chapters as page bundles or markdown files.
# -----------------------------------------------------------------------------
title: "Sliding Window"
date: 2026-04-26T13:06:22+05:30
draft: false
type: "courses"

# --- Course meta -------------------------------------------------------------
summary: "A technique that processes a subset (window) of elements in a list or string by moving it incrementally instead of recomputing from scratch.
It is used to optimize problems involving contiguous subarrays, often reducing time complexity from O(n²) to O(n)."
level: "Intermediate"
estimatedHours: 6
chapterCount: 0
prerequisites: []          # e.g. ["Arrays basics", "Big-O notation"]
tags: []

# --- SEO ---------------------------------------------------------------------
description: "sliding window technique, subarray problems, two pointers technique"
keywords: ["course", "tutorial"]
author: "Tech Tutorials Team @ Retraini"
canonical: ""
ogImage: "/images/og-default.png"
ogType: "website"

# --- Visual theme ------------------------------------------------------------
# Available themes:
#   orange | lime | sky | lavender | peach | mint | rose | coral | butter | sand | neutral
theme: "lavender"
---

Sliding Window is a core pattern in algorithm design, especially useful for array and string problems that involve contiguous elements. Instead of repeatedly recalculating results for every possible subarray, the window “slides” across the data—expanding when needed and shrinking when constraints are violated. This reuse of previous computations makes the approach highly efficient.

There are two primary variations: fixed-size and variable-size windows. Fixed-size windows maintain a constant length, while variable-size windows dynamically grow and shrink based on conditions such as sum, uniqueness, or frequency. Advanced versions combine sliding windows with hash maps or monotonic data structures to handle more complex constraints like frequency tracking or maximum/minimum queries.
