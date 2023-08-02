- Create dynamic list of SCRIPTs SELECTOR LIST from package.json

  - remove the install option
  - try to calculate the install script in a dynamic script selector.

- Build process

  - Calculate the order of build dependencies depending on the order of the package.json.
  - Build the dependencies in order.

---

BUGS
-- Seems that the dependency script keep being freeze when comes from loaded data.
-- Toaster too huge needs scroll.
