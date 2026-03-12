export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "chore", // maintenance, deps
        "style", // formatting, no logic change
        "refactor", // code restructure
        "perf", // performance
        "docs", // documentation
        "test", // tests
        "revert", // revert a commit
        "ci", // CI/CD changes
        "build", // build system changes
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 72],
  },
};
