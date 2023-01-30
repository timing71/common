# Timing71 Common

![AGPL v3.0](https://img.shields.io/github/license/timing71/common)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/timing71/common/test.yml)
![npm (scoped)](https://img.shields.io/npm/v/@timing71/common)

[Timing71](https://www.timing71.org/) is a motorsports live timing aggregation
and analysis system. This package contains common functions used by the Timing71
website, command-line application and backend services.

- `messages/` contains generators for the messages that appear in the bottom
  third of the timing screen.
- `analysis/` defines the `mobx-state-tree` object that provides real-time
  analysis and statistics.
- `racing.js` contains the enum-like classes `Stat` and `FlagState` used
  extensively throughout the other codebases.
- `replay.js` contains functions to _read_ replay files, as well as the
  `createIFrame` method used to help generate them.
- `services.js` defines the main base class for all interfaces with upstream
  timing providers, `Service`, as well as a boilerplate `HTTPPollingService`
  class for simple cases. It also contains the main service provider registry;
  additional service provider classes should define a static property `regex`
  to define which source URLs should use that provider, then register
  themselves using the `registerServiceProvider(clazz)` method.
- `statExtractor.js` defines the `StatExtractor` class, a helper to extract a
  given `Stat` for a car from a Common Timing Format frame.

Other files contain miscellaneous other pieces of shared code, such as time and date handling and formatting.

## Test suite

A test suite using `jest` is provided and can be run using `yarn run test`.
