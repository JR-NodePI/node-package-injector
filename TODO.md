- Add dynamic list of SCRIPTs SELECTOR LIST for dependencies.

  - remove current script selector list from the dependencies.
  - try to calculate the install script in a dynamic script selector. the 1º
  - try to calculate the dist script in a dynamic script selector. the 2º

- Build process

  - Calculate the order of build dependencies depending on the order of the package.json.
  - Build the dependencies in order.

- Sync process

  - Try to use npm workspaces to sync the dependencies.

---

BUGS
-- Toaster too huge needs scroll.
