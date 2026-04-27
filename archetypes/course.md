---
# -----------------------------------------------------------------------------
# Course archetype — a course belongs to a track.
# Place at: content/tracks/<track-slug>/<course-slug>/_index.md
# A course contains multiple chapters as page bundles or markdown files.
# -----------------------------------------------------------------------------
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
type: "courses"

# --- Course meta -------------------------------------------------------------
summary: "Short blurb shown on course cards (1–2 sentences)."
level: "Intermediate"
estimatedHours: 6
chapterCount: 0
prerequisites: []          # e.g. ["Arrays basics", "Big-O notation"]
tags: []

# --- SEO ---------------------------------------------------------------------
description: "What this course teaches in plain language."
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

Course-level introduction. Renders above the chapter list.
