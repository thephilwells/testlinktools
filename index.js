// Put Testlink XML files in /xml
// Run index.js
// Output will be Istanbul-like coverage report for all test steps
const fs = require('fs')
const objtree = require('objtree')
const xotree = new objtree()

// Collect XML files from folder

let finalObj = {}
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
  finalObj.testsuite = {
    name: obj.testsuite["-name"],
    testsuite: getSuites(obj.testsuite),
    testcase: testCaseAtThisLevel,
    numberOfTestSteps: testStepsAtThisLevel,
    percentAutomated: (100 * (numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
    percentManual: (100 * (1 - numberAutomatedAtThisLevel / testStepsAtThisLevel)).toFixed(2),
  }
})

/**
 * {parentSuite} [array]
 */
function getSuites(parentSuite) {
  if (parentSuite) {
    for (let i = 0; i < parentSuite.length; i++) {
      const testCaseAtThisLevel = getTestCases(parentsuite.testcase)
      const testStepsAtThisLevel = testCaseAtThisLevel.steps.length
      const numberAutomatedAtThisLevel = testCaseAtThisLevel.numberAutomated
      subSuites[i] = {
        name: parentsuite[i]['-name'],
        testsuite: getSuites(parentSuite[i].testsuite),
        testcase: testCaseAtThisLevel,
        numberOfTestCases: testStepsAtThisLevel,
        percentAutomated: (numberAutomatedAtThisLevel / testStepsAtThisLevel).toFixed(2),
        percentManual: (1 - numberAutomatedAtThisLevel / testStepsAtThisLevel).toFixed(2),
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
        id: testcase.externalid,
        steps: noSteps,
        numberAutomated: calculateNumberAutomated(noSteps)
      })
    })
  }
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

console.log(JSON.stringify(finalObj))

// Calculate coverage percentage

// Update total coverage percent

// Pretty print stats for this xml