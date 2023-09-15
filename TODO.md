- Build process

  - Calculate the order of build dependencies depending on the order of the package.json.
  - Build the dependencies in order.

- Sync process

  - Try to use npm workspaces to sync the dependencies.

---

BUGS

- DON´T show dist script when is not a dependency
