---
title: "Chapter 1 — Project Setup and First Endpoint"
date: 2026-01-25
draft: false
type: "chapters"
order: 1
estimatedMinutes: 30
summary: "Set up a FastAPI app, run a local server, and create your first JSON endpoint."
tags: ["fastapi", "setup", "routing"]

description: "Create a basic FastAPI service and understand the request-response flow."
keywords: ["fastapi hello world", "python api"]
author: "Tech Tutorials Team"
ogImage: "/images/og-default.png"
ogType: "article"

theme: "lavendar"
---

Start with a tiny app and verify your endpoint works.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

Run the server and visit `/docs` to test your endpoint.
