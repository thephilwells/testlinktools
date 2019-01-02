// Put Testlink XML files in /xml
// Run index.js
// Output will be Istanbul-like coverage report for all test steps
const fs = require('fs')
const objtree = require('objtree')
const Table = require('cli-table')

const xotree = new objtree()

// Collect XML files from folder

let finalArr = []
let subSuites = []
let totalSteps = 0
let totalAutomatedSteps = 0

const xmlFolder = './xml/'
fs.readdirSync(xmlFolder).forEach(file => {
  let xml = fs.readFileSync(`./xml/${file}`, 'utf-8')

  // For each xml, create an object with Tests, Steps, and Execution values
  let obj = xotree.parseXML(xml)
  const testCaseAtThisLevel = getTestCases(obj.testsuite.testcase)
  const testStepsAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => {return acc + cur.steps.length}, 0)
  const numberAutomatedAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => {return acc + cur.numberAutomated}, 0)
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
  totalSteps = 0
  totalAutomatedSteps = 0
  finalArr.push(finalObj)
})

/**
 * {parentSuite} [array]
 */
function getSuites(parentSuite) {
  if (parentSuite) {
    for (let i = 0; i < parentSuite.length; i++) {
      const testCaseAtThisLevel = getTestCases(parentSuite[i].testcase)
      const testStepsAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => {return acc + cur.steps.length}, 0)
      const numberAutomatedAtThisLevel = testCaseAtThisLevel.reduce((acc, cur) => {return acc + cur.numberAutomated}, 0)
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

function getTestCases(testCaseBlock) {
  let cases = []
  if (testCaseBlock) {
    testCaseBlock.forEach(testcase => {
      let noSteps = testcase.steps.step
      cases.push({
        id: testcase['-name'],
        steps: noSteps,
        numberAutomated: calculateNumberAutomated(noSteps)
      })
      totalSteps += noSteps.length
    })
  }
  totalAutomatedSteps += cases.reduce((acc, cur) => {return acc + cur.numberAutomated}, 0)
  return cases
}

function calculateNumberAutomated(steps) {
  totalAutomated = 0
  steps.forEach(step => {
    if (step.execution_type === '2') {
      totalAutomated++
    }
  })
  return totalAutomated
}


// console.log(JSON.stringify(finalObj))

const table = new Table({
  head: ['Test', '# of Steps', '% Automated', '% Manual'],
  colWidths: [80, 15, 15, 15]
})

// Pretty print stats for this xml
finalArr.forEach(suite => {
  table.push([
    ` ${suite.testsuite.name}`,
    suite.totalSteps,
    (100 * (suite.totalAutomatedSteps / suite.totalSteps)).toFixed(2),
    (100 * (1 - suite.totalAutomatedSteps / suite.totalSteps)).toFixed(2),
  ])
  suite.testsuite.testsuite.forEach(subSuite => {
    table.push([
      `  ${subSuite.name}`,
      subSuite.totalSteps,
      subSuite.percentAutomated,
      subSuite.percentManual
    ])
    subSuite.testcase.forEach(testCase => {
      table.push([
        `   ${testCase.id}`,
        testCase.steps.length,
        (100 * (testCase.numberAutomated / testCase.steps.length)).toFixed(2),
        (100 * (1 - testCase.numberAutomated / testCase.steps.length)).toFixed(2),
      ])
    })
  })
})

console.log(table.toString())