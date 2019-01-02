// Put Testlink XML files in /xml
// Run index.js
// Output will be Istanbul-like coverage report for all test steps
const fs = require('fs')
const path = require('path')
const objtree = require('objtree')
const Table = require('cli-table')

const xotree = new objtree()


const EXECUTION_TYPE_STRING = '2'

let finalArr = []
let subSuites = []
let totalSteps = 0
let totalAutomatedSteps = 0
let grandTotalSteps = 0
let grandTotalAutomatedSteps = 0

// Collect XML files from folder
const xmlFolder = './xml/'
fs.readdirSync(xmlFolder).forEach(file => {
  if (path.extname(file) === '.xml') {
    let xml = fs.readFileSync(`./xml/${file}`, 'utf-8')

    // For each xml, create an object with Tests, Steps, and Execution values
    let obj = xotree.parseXML(xml)
    const testCaseAtThisLevel = getTestCases(obj.testsuite.testcase)
    const testStepsAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => { return acc + cur.steps.length }, 0)
    const numberAutomatedAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => { return acc + cur.numberAutomated }, 0)
    let finalObj = {}
    finalObj.testsuite = {
      name: obj.testsuite["-name"],
      testsuite: getSuites(obj.testsuite.testsuite),
      testcase: testCaseAtThisLevel,
      numberOfTestSteps: testStepsAtThisLevel,
      percentAutomated: (100 * (numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
      percentManual: (100 * (1 - numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
    }
    finalObj.totalSteps = totalSteps
    finalObj.totalAutomatedSteps = totalAutomatedSteps
    grandTotalSteps += totalSteps
    grandTotalAutomatedSteps += totalAutomatedSteps
    totalSteps = 0
    totalAutomatedSteps = 0
    finalArr.push(finalObj)
  }
})

// Pretty print stats for this xml
const table = new Table({
  head: ['Test', '# of Steps', '% Automated', '% Manual'],
  colWidths: [80, 15, 15, 15]
})

finalArr.forEach(suite => {
  table.push([
    ` SUITE: ${suite.testsuite.name}`,
    suite.totalSteps,
    (100 * (suite.totalAutomatedSteps / suite.totalSteps)).toFixed(2),
    (100 * (1 - suite.totalAutomatedSteps / suite.totalSteps)).toFixed(2),
  ])
  suite.testsuite.testcase.forEach(testCase => {
    table.push([
      `  ${testCase.name}`,
      testCase.steps.length,
      (100 * (testCase.numberAutomated / testCase.steps.length)).toFixed(2),
      (100 * (1 - testCase.numberAutomated / testCase.steps.length)).toFixed(2),
    ])
  })
  suite.testsuite.testsuite.forEach(subSuite => {
    table.push([
      `  SUB-SUITE: ${subSuite.name}`,
      subSuite.totalSteps,
      subSuite.percentAutomated,
      subSuite.percentManual
    ])
    subSuite.testcase.forEach(testCase => {
      table.push([
        `   ${testCase.name}`,
        testCase.steps.length,
        (100 * (testCase.numberAutomated / testCase.steps.length)).toFixed(2),
        (100 * (1 - testCase.numberAutomated / testCase.steps.length)).toFixed(2),
      ])
    })
  })
})

// Last row
table.push([
  'GRAND TOTAL',
  grandTotalSteps,
  (100 * (grandTotalAutomatedSteps / grandTotalSteps)).toFixed(2),
  (100 * (1 - grandTotalAutomatedSteps / grandTotalSteps)).toFixed(2),
])

console.log(table.toString())

/**
 * Strips busy test cases down to just the data we need
 * @param {array} testCaseBlock 
 */
function getTestCases(testCaseBlock) {
  let cases = []
  if (testCaseBlock) {
    testCaseBlock.forEach(testcase => {
      let noSteps = testcase.steps.step
      cases.push({
        name: testcase['-name'],
        steps: noSteps,
        numberAutomated: calculateNumberAutomated(noSteps)
      })
      totalSteps += noSteps.length
    })
  }
  totalAutomatedSteps += cases.reduce((acc, cur) => { return acc + cur.numberAutomated }, 0)
  return cases
}

/**
 * Given an array of test steps returns a number signifying how many are marked 'Automated'
 * @param {array} steps 
 */
function calculateNumberAutomated(steps) {
  totalAutomated = 0
  steps.forEach(step => {
    if (step.execution_type === EXECUTION_TYPE_STRING) {
      totalAutomated++
    }
  })
  return totalAutomated
}

/**
 * Recursively creates testsuite objects, including their nested test cases
 * @param {array} parentSuite 
 */
function getSuites(parentSuite) {
  if (parentSuite) {
    for (let i = 0; i < parentSuite.length; i++) {
      const testCaseAtThisLevel = getTestCases(parentSuite[i].testcase)
      const testStepsAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => { return acc + cur.steps.length }, 0)
      const numberAutomatedAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => { return acc + cur.numberAutomated }, 0)
      subSuites[i] = {
        name: parentSuite[i]['-name'],
        testsuite: parentSuite[i].testsuite ? getSuites(parentSuite[i].testsuite) : null,
        testcase: testCaseAtThisLevel,
        totalSteps: testStepsAtThisLevel,
        percentAutomated: (100 * (numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
        percentManual: (100 * (1 - numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
      }
    }
  }
  return subSuites
}
