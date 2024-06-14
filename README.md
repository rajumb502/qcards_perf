# QCard Performance Tests

This project contains scripts to run performance tests using k6. It includes tests for assessments and attendances in different environments.

## Requirements

- [Node.js](https://nodejs.org/)
- [k6](https://k6.io/)


## Prerequisites

- Node.js installed on your machine.
- k6 installed globally. You can install it using Homebrew on macOS:
  ```bash
  brew install k6
  
## Installation

To install the required dependencies, run:

```bash
npm install
```

## Scripts
### The following scripts are available to run the tests:

## Running Assessments Tests
#### Development Environment
To run the assessments test in the development environment, use:

```
npm run test:assessments
```
---
***NOTE***

* This command will Prepare assessment data by running prepare-assessment-data.js with the ENVIRONMENT_NAME set to development.
* Run the k6 tests defined in assessment.js, outputting the results to _assessments_results.json.


---

#### Staging Environment
To run the assessments test in the development environment, use:

```
npm run test:assessments:staging
```
---
***NOTE***

* This command will Prepare assessment data by running prepare-assessment-data.js with the ENVIRONMENT_NAME set to staging.
* Run the k6 tests defined in assessment.js, outputting the results to _assessments_staging_results.json.


---


## Running Attendance Tests
#### Development Environment
To run the attendance test in the development environment, use:

```
npm run test:attendance
```
---
***NOTE***

* Run the k6 tests defined in attendance.js, outputting the results to _attendance_results.json.


---

#### Staging Environment
To run the attendance test in the development environment, use:

```
npm run test:attendance:staging
```
---
***NOTE***

* Run the k6 tests defined in attendance.js, outputting the results to _attendance_results.json.


---
