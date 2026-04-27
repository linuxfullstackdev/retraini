---
title: "Code Tabs Test"
description: "Test page for code-tabs shortcode"
---

# Code tabs test

## New fenced syntax (VSCode highlighting friendly)

{{< code-tabs >}}
  {{< code-tab title="Python" >}}
```python
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```
  {{< /code-tab >}}
  {{< code-tab title="Golang" >}}
```go
package main

import "fmt"

func main() {
	fmt.Println("hello")
}
```
  {{< /code-tab >}}
{{< /code-tabs >}}

## Backward-compatible legacy syntax

{{< code-tabs >}}
  {{< code-tab lang="python" title="Python" >}}
# Python code
print("hello")
  {{< /code-tab >}}
  {{< code-tab lang="go" title="Golang" >}}
// Go code
fmt.Println("hello")
  {{< /code-tab >}}
{{< /code-tabs >}}
