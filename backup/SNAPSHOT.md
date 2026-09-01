# Black DEX backup

Date: 2026-09-01
Repo: thewinged777-oss/black-dex-0271
Commit: 4c582c32cbda1df016fcc0cc3696a2e770772f6c
Branch freeze: backup/2026-09-01-premium-baseline

This is the tree after Markets polish, original Trade layout, theme-switcher fix, and Portfolio chrome (gold wells, theme Affiliates chip, connect-wallet notice without banner).

Restore:

```
git fetch origin
git checkout backup/2026-09-01-premium-baseline
```

Or reset a working copy:

```
git checkout main
git reset --hard 4c582c32cbda1df016fcc0cc3696a2e770772f6c
```
