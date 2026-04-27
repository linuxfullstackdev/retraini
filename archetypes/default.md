---
# -----------------------------------------------------------------------------
# Default front matter — used by `hugo new <path>.md` when no more specific
# archetype matches. Keep fields in sync with partials/seo.html so all SEO
# tags get filled out automatically.
# -----------------------------------------------------------------------------
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true

# --- SEO ---------------------------------------------------------------------
description: "Short, compelling summary (<160 chars) shown in search engines."
keywords: ["keyword-1", "keyword-2"]
author: "Tech Tutorials Team"
canonical: ""              # leave blank to default to .Permalink
ogImage: "/images/og-default.png"
ogType: "article"          # one of: website, article, book, profile
twitterCard: "summary_large_image"

# --- Visual theme ------------------------------------------------------------
# Theme chooser — pick one of the available pastel palettes for cards & title
# bars. White text is rendered on a darker variant of the palette in the title
# bar; the page itself uses a soft tint of the same hue as a subtle accent.
#
# Available themes (see static/css/main.css):
#   orange | lime | sky | lavender | peach | mint | rose | coral | butter | sand
theme: "sky"
---

Write your content here. Markdown, raw HTML and Hugo shortcodes are all
supported.
