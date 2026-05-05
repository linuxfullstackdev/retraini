---
title: "Canary Deployments: Ship With Confidence"
date: 2026-05-03T10:00:00+05:30
draft: false
type: "post"
weight: 1
order: 1

estimatedMinutes: 8
summary: "Most teams deploy wrong — all at once, fingers crossed. Canary deployments fix that by sending a small slice of real traffic to the new version first, so you catch problems before they hit everyone."

tags: ["deployments", "devops", "aws", "canary", "ci-cd"]

description: "Learn how canary deployments work, how they compare to blue/green and rolling strategies, and how to implement them in AWS with Lambda aliases and CodeDeploy."
keywords: ["canary deployment", "deployment strategies", "blue green deployment", "aws codedeploy", "lambda aliases", "feature flags", "devops", "zero downtime deployment"]

author: "Retraini Trainer"
canonical: ""
ogImage: "/images/og-default.png"
ogType: "article"
twitterCard: "summary_large_image"

theme: "lime"
---

# You've Been Deploying Wrong. Here's What Canary Deployments Taught Me.

Let me tell you about the worst Friday of my career.

We had a payment service update ready. Tested thoroughly — unit tests passing, staging looked clean, the team was confident. We pushed it to production at 4:45pm. By 5:10pm, our on-call phone was ringing. Payment failures were spiking. Twenty-five minutes of 100% failure rate before we rolled back. By then, we'd dropped somewhere in the range of thousands of rupees in failed transactions, had three angry enterprise clients on the phone, and I was eating dinner at my desk at 11pm writing an incident report.

The bug? A one-line change in how we serialised the amount field for the Stripe API. Worked perfectly in staging. Broke in production because staging didn't have the same regional currency config as prod.

That incident is why I care deeply about how we deploy software. And it's why, when someone tells me they "tested it in staging," I no longer nod along like that's sufficient.

---

## The Problem With How Most Teams Deploy

Here's what a typical deployment looks like at most companies:

Code gets merged. CI runs tests. If tests pass, someone clicks deploy. The new version replaces the old one. Everyone holds their breath for five minutes, checks the dashboards, and goes back to their day.

This works fine — until it doesn't. And when it doesn't, it fails for everyone at once.

The fundamental problem is that we treat deployment as a binary event. It's either deployed or it isn't. The new code is either running or it isn't. There's no middle ground, no gradual transition, no opportunity to say "wait, something looks off" before the entire user base is affected.

And here's the thing nobody tells you upfront: **your production environment will always behave differently from staging.** Real users do unexpected things. Real traffic has patterns you didn't anticipate. Real third-party APIs have quirks that only show up at scale. Your test suite, however good it is, cannot replicate this.

So what do you do?

---

## A 19th Century Mining Trick That Solves a 21st Century Problem

Coal miners used to carry canary birds into mines with them.

Canaries are significantly more sensitive to carbon monoxide than humans. If there was a dangerous gas leak, the canary would show symptoms — or die — before any of the miners were in serious danger. It was a living early warning system. The canary's distress was the signal to get out before it was too late.

The same concept, applied to software deployment, is what we call a **canary deployment**.

Instead of switching 100% of your traffic to the new version at once, you send a small slice — say 5% — to the new version first. That 5% is your canary. You watch it closely. If errors spike, if latency increases, if something behaves unexpectedly — you caught it before 95% of your users ever experienced it. Roll back instantly. Fix the problem. Try again.

If the canary looks healthy, you gradually increase the percentage. 5% → 20% → 50% → 100%. At each stage you're gaining confidence from real traffic, not from synthetic tests.

---

## What You're Actually Watching

The shift in mindset here is important. A canary deployment isn't just a deployment strategy — it's an **observation window**.

During those first minutes when 5% of traffic hits the new version, you're not just waiting. You're actively watching:

**Error rates.** Did 5xx errors increase on the new version? Even a small uptick — say, error rate going from 0.1% to 0.8% — is a signal worth investigating before you roll out to everyone.

**Latency.** Is the new version responding slower? A payment API that suddenly takes 800ms instead of 200ms might not throw errors, but it's degrading the user experience for real customers right now.

**Business metrics.** This is the one teams forget. Your infrastructure metrics might look fine, but what's the checkout completion rate for users hitting the new version? Are cart abandonments up? Payment success rate down? Sometimes a bug doesn't cause a 500 error — it just causes users to silently give up.

**Logs.** Are there new error types appearing that your alerting didn't catch? Warnings you haven't seen before?

When you put it this way, you realise canary deployment is really just applying the scientific method to production. You have a hypothesis (the new version is better), you run a controlled experiment (5% of traffic), and you observe the results before drawing a conclusion.

---

## How It Actually Works in Practice

Let's make this concrete, because "send 5% of traffic" sounds simple until you try to implement it.

In AWS, if you're running Lambda functions behind API Gateway, you define something called an **alias** — essentially a named pointer to your function. You can configure that alias to split traffic between two versions:

```
Lambda function: PaymentHandler
  Version 12 (current, stable) ← 95% of traffic
  Version 13 (new)             ← 5% of traffic

Both point to the same alias: "PROD"
API Gateway hits the alias, Lambda handles the split
```

Your API Gateway doesn't change at all. The load balancing happens inside Lambda. When you're confident, you shift the weights: 50/50, then 100/0. When you're done, version 12 gets zero traffic and you can eventually clean it up.

For containerised services on ECS, AWS CodeDeploy handles this for you. You define a deployment configuration that reads almost like plain English:

- `Canary10Percent5Minutes` — send 10% to the new version for 5 minutes, then if healthy, shift the remaining 90%
- `Linear10PercentEvery1Minute` — increase by 10% every minute over 10 minutes
- `Canary10Percent30Minutes` — more cautious, give it half an hour before committing

You can attach a CloudWatch alarm to any of these. If the alarm triggers during the canary window — error rate too high, latency too bad — CodeDeploy rolls back automatically. No human intervention required. The system watches its own canary.

---

## Canary vs The Other Strategies

It's worth knowing where canary sits in the landscape, because teams often mix up the terminology.

{{< grid cols="1" >}}
  {{< feature title="Recreate" >}}
    is the bluntest instrument. Stop the old version, deploy the new one, restart. There's downtime between the two. Fine for dev environments. Unacceptable for production services where users are transacting.

    Stop v1 completely → deploy v2

    Risk:     High — downtime during switch
    Use when: Dev environment, or stateful apps
          that can't run two versions simultaneously
  {{< /feature >}}
  {{< feature title="Rolling deployments" >}}
    are what most people default to. You update instances one by one — replace one server, check it's healthy, replace the next. At any point during the rollout, some instances are running the old version and some are running the new. It's better than recreate, but you're still eventually getting all your traffic to the new version without a prolonged observation window.

    
    Replace instances one by one
    v1: [■ ■ ■ ■] → [■ ■ ■ □] → [■ ■ □ □] → [□ □ □ □]
    v2:             [□ □ □ ▲] → [□ □ ▲ ▲] → [▲ ▲ ▲ ▲]

    Risk:     Medium — partial exposure during rollout
          two versions running simultaneously
    Use when: Standard production deployments
          where downtime is unacceptable

    
  {{< /feature >}}
  {{< feature title="Blue/green" >}}
    is where you maintain two identical production environments. Blue is live. Green is your new version, sitting warm but receiving no traffic. You test green, you smoke test it, you load test it — then you flip the load balancer. Green is now live, blue is now standby. Rollback is instant: flip the load balancer back. It's excellent for high-stakes deployments, but you're paying for double the infrastructure during the transition. And you're still doing a big-bang switch at the moment of cutover.

    Run two identical environments simultaneously
    Blue  = current production (v1) — 100% traffic
    Green = new version (v2)        — 0% traffic

    Test green thoroughly (load tests, smoke tests)
    Switch DNS/load balancer: green gets 100% instantly
    Keep blue running for instant rollback

    Risk:     Low for users, but expensive
            (double infrastructure cost during switch)
    Use when: High stakes releases, database migrations
            regulatory compliance requirements
            
  {{< /feature >}}
  {{< feature title="Canary" >}}
    is where you use real production traffic as your final validation layer. It's more nuanced than blue/green but it gives you something no other strategy does — actual user behaviour data on the new version, with a controlled blast radius.

    Risk:     Lowest — real validation, minimal exposure
    Use when: Frequent deploys, want real-world validation
            microservices, Lambda functions
  {{< /feature >}}

  {{< feature title="Feature Flags" >}}
    Deploy v2 code to all instances
    But new feature is OFF by default

    Turn it on for:
    - Internal users first
    - 1% of users
    - Specific user segments (beta users, paid tier)
    - Specific regions

    Risk:     Very low — code is deployed but dormant
    Use when: You want to separate deployment from release
            A/B testing features
            Gradual feature rollout independent of infra
  {{< /feature >}}
  
{{< /grid >}}

---

## Diagram: Rolling vs Canary vs Blue/Green vs Feature Flags

### Rolling Deployment
{{< mermaid >}}
flowchart TD
    R1([🚀 Deploy triggered]) --> R2["All 4 instances running v1\n■ ■ ■ ■"]
    R2 --> R3["Replace instance 1\n▲ ■ ■ ■"]
    R3 --> R4{Healthy?}
    R4 -->|No| R5["Halt rollout\nInvestigate"]
    R4 -->|Yes| R6["Replace instance 2\n▲ ▲ ■ ■"]
    R6 --> R7["Replace instance 3\n▲ ▲ ▲ ■"]
    R7 --> R8["Replace instance 4\n▲ ▲ ▲ ▲"]
    R8 --> R9([✅ 100% on v2])
{{< /mermaid >}}

### Blue-Green Deployment
{{< mermaid >}}
flowchart TD
    B1([🚀 Deploy triggered]) --> B2["Blue live → 100% traffic\nGreen idle → v2 deployed"]
    B2 --> B3["Run smoke tests on Green"]
    B3 --> B4{Tests pass?}
    B4 -->|No| B5["Fix and redeploy to Green\nBlue still live, users unaffected"]
    B5 --> B3
    B4 -->|Yes| B6["Flip load balancer → Green 100%"]
    B6 --> B7{Issues found?}
    B7 -->|Yes| B8["Flip back to Blue\nInstant rollback"]
    B7 -->|No| B9["Decommission Blue or keep as standby"]
    B9 --> B10([✅ 100% on v2])
{{< /mermaid >}}

### Canary Deployment
{{< mermaid >}}

flowchart TD
    C1([🚀 Deploy triggered]) --> C2["100% traffic → v1\nv2 deployed but idle"]
    C2 --> C3["Shift 5% → v2\n95% still on v1"]
    C3 --> C4["⏱ Observe 10–30 min\nerrors · latency · business metrics"]
    C4 --> C5{Metrics healthy?}
    C5 -->|No| C6["Rollback to 0%\nOnly 5% users affected"]
    C5 -->|Yes| C7["Shift 20% → v2"]
    C7 --> C8["⏱ Observe again"]
    C8 --> C9{Still healthy?}
    C9 -->|No| C6
    C9 -->|Yes| C10["Shift 50% → v2"]
    C10 --> C11["⏱ Observe"]
    C11 --> C12{Still healthy?}
    C12 -->|No| C6
    C12 -->|Yes| C13["Shift 100% → v2"]
    C13 --> C14([✅ 100% on v2])

{{< /mermaid >}}

None of these are universally superior. The right choice depends on your system, your team, and your risk tolerance. Most mature teams end up using different strategies for different situations — canary for API and service deployments, blue/green for database migrations, feature flags for gradual feature rollouts.

## The Concept That Changes Everything: Separating Deployment From Release

Here's the mental model that ties all of this together.

Most teams treat "deploy" and "release" as the same event. The code goes out, users get the feature, done. But they're actually two separate things, and keeping them separate gives you enormous power.

**Deployment** is the act of getting code onto your servers. **Release** is the act of making that code available to users.

Canary deployments blur this line a little — you're releasing to a small percentage of users. But **feature flags** separate them completely. You deploy the new code to all your servers, but the feature is switched off by default. Nobody sees it. Then you turn it on for:

- Internal users first (your own team dogfoods it)
- 1% of users
- Beta programme members
- A specific region
- Paid tier only
- 100% of everyone

At any point you can toggle it off instantly — not a rollback, just a flag flip. The code is still deployed. It's just dormant.

This is how large companies ship features to hundreds of millions of users without incident. The code goes out in a normal deployment. The feature gets turned on gradually, one segment at a time, while the team watches the metrics. AWS AppConfig, LaunchDarkly, and Unleash are common tools for managing this.

---

## A Real Scenario — Payment Lambda

Applying this to the payment architecture:

**Current**: PaymentHandler v5 — stable, processing ₹10L/day

**New**: PaymentHandler v6 — refactored Stripe integration

**Risk of full rollout**:
  If v6 has a bug in the Stripe call
  100% of payments fail
  Business loses revenue every minute until rollback
  Ops team scrambling at 2am

**Canary approach**:
  Deploy v6, set alias: 95% → v5, 5% → v6

  Watch for 30 minutes:
    Error rate on v6?           → same as v5, good
    Stripe API latency on v6?   → slightly better, good
    Payment success rate on v6? → identical, good

  Shift to 50/50, watch again
  Shift to 100% v6
  Total exposure if bug found:  
  5% of payments for 30 min
    **full rollout**:              
    100% of payments until detected

---




## Back to That Friday Night

If we'd had a canary deployment in place for that payment service change, here's how it would have gone:

5% of traffic hits the new version. Within two minutes, we'd have seen payment failure rate climb from 0.1% to 8% on that slice. Alarm fires. CodeDeploy rolls back. Twelve users were affected instead of twelve hundred. The incident report is three paragraphs instead of three pages. I eat dinner at home.

The bug still existed. The staging environment still didn't catch it. But the blast radius was contained because we didn't bet the entire production system on a deployment that hadn't been validated by real traffic yet.

That's the whole point. You're not trying to eliminate risk — that's impossible. You're trying to make sure that when something goes wrong, and eventually something always goes wrong, the damage is proportional and recoverable.

A canary deployment doesn't make you a better engineer. It makes you a more honest one — honest about the fact that no test suite is perfect, that production is always different from staging, and that the right way to gain confidence in a deployment is to expose it to reality slowly, with your finger on the rollback button.

Ship small. Watch carefully. Roll back fast. That's it. That's the whole philosophy.

---

*If this resonated, the next thing worth understanding is feature flags and how teams like Netflix and Meta use them to decouple shipping code from releasing features — the logical next step from everything we covered here.*
