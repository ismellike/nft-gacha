# Security Policy

SPINFI handles on-chain funds, so we take security seriously and appreciate
responsible disclosure.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately using GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability):
open the repository's **Security** tab → **Report a vulnerability**.

Please include:

- A description of the issue and its impact
- Steps to reproduce (or a proof-of-concept)
- Affected component and, if on-chain, the contract/function and network
- Any suggested remediation

We aim to acknowledge reports within a few business days and will keep you updated
as we investigate and ship a fix. Please give us reasonable time to remediate before
any public disclosure.

## Scope

In scope:

- Smart contracts in [`contracts/src`](./contracts/src) — fund loss, unauthorized
  access, incorrect accounting, randomness or appraisal manipulation, access-control
  and upgrade-safety issues
- Off-chain WAVS components in [`packages/`](./packages) that affect on-chain
  outcomes (randomness derivation, appraisal integrity)
- The web frontend in [`frontend/`](./frontend) — e.g. transaction spoofing or
  wallet-interaction flaws

Out of scope:

- Vulnerabilities in third-party dependencies without a demonstrated impact here
- Issues requiring a compromised operator key, RPC provider, or user device
- Denial of service against local/test infrastructure

## Contract security documentation

The trust model, invariants, and audit-oriented analysis of the contracts are
documented in [`contracts/SECURITY.md`](./contracts/SECURITY.md). Contract source is
MIT-licensed (see SPDX headers); the overall project is licensed under AGPL-3.0.
