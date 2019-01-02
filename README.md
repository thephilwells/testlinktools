# Phil's TestLink Helper Tools

I set up this repo to add some command line tools to help folks deal with data exported from TestLink. Right now there's only one tool, alas.

## TestLink Automated Test Steps Coverage Tracker

This tool will output a graph showing how many test steps are in each of your test cases, as well as what percentage of them are marked 'Automated' as their execution type.

NB: This assumes that your exported data has an `execution_type` value of `"2"` for test case steps marked `Automated`.

Here's how to use it:

1. Select the test suite you'd like to run a report on.
1. Export the test suite in XML format, saving it in this project directory under `/xml`
1. Repeat for as many test suites as you'd like to generate reports for
1. In the project root run `node index.js`

That should do it!

Output will look something like this:
```
┌────────────────────────────────────────────────────────────────────────────────┬───────────────┬───────────────┬───────────────┐
│ Test                                                                           │ # of Steps    │ % Automated   │ % Manual      │
├────────────────────────────────────────────────────────────────────────────────┼───────────────┼───────────────┼───────────────┤
│  SUITE: Calculator                                                             │ 15            │ 53.33         │ 46.67         │
├────────────────────────────────────────────────────────────────────────────────┼───────────────┼───────────────┼───────────────┤
│   Adding integers                                                              │ 6             │ 66.67         │ 33.33         │
├────────────────────────────────────────────────────────────────────────────────┼───────────────┼───────────────┼───────────────┤
│   Multiplying integers                                                         │ 5             │ 0.00          │ 100.00        │
├────────────────────────────────────────────────────────────────────────────────┼───────────────┼───────────────┼───────────────┤
│   Divide By Zero                                                               │ 4             │ 100.00        │ 0.00          │
.
.
.
│    Memory button loads number from memory                                      │ 9             │ 0.00          │ 100.00        │
├────────────────────────────────────────────────────────────────────────────────┼───────────────┼───────────────┼───────────────┤
│ GRAND TOTAL                                                                    │ 275           │ 23.64         │ 76.36         │
└────────────────────────────────────────────────────────────────────────────────┴───────────────┴───────────────┴───────────────┘
```