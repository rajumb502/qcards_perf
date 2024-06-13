import { configurations } from "./config.js";
import fs from "fs";

export const prepareAssessmentData = async () => {
  const fileName = "./prepared_csa_ids.js";
  let environment;
  /*
    Remove the Existing File of Assessment Ids
  */
  try {
    fs.unlinkSync(fileName);
  } catch (error) {}

  /*
     This code parses command-line arguments to extract the environment name specified with --ENVIRONMENT_NAME=, 
     then checks if the environment is valid based on a predefined configuration object, 
     throwing an error if it is not.
  */
  for (const args of process.argv) {
    if (args.includes("--ENVIRONMENT_NAME=")) {
      environment = args.split("=")[1];
    }
  }
  if (
    !environment ||
    Object.keys(configurations).includes(environment) === false
  ) {
    throw new Error("Provide the valid Environment");
  }
  /*
   * Gets the details from configurations based on the environment
   */
  const { api_url, classIds, subjectIds, questionIds } =
    configurations[environment];

  /*
   *  Prepare the Payload for Create Assessment
   */
  const raw = JSON.stringify({
    assessmentInput: {
      name: "Performance Tests",
      description: "Performance Tests",
      schoolId: 1,
      totalMarks: 30,
      totalQuestions: 30,
    },
    assessmentSectionQuestionInputs: [
      {
        section: {
          name: "",
          description: "",
          negativeMarking: false,
          negativeMarkingPercentage: 0,
          totalMarks: 30,
          totalQuestions: 30,
        },
        questions: questionIds,
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
  };
  const result = await (
    await fetch(api_url + "/assessments", { ...requestOptions, body: raw })
  ).json();

  /*
   * This code iterates over arrays of class and subject IDs,
   * sends a request to an API for each class-subject pair,
   * and appends the resulting data to a file in JSON format.
   * The output is logged to the assessmentIds.json file with JSON entries are correctly formatted with commas and newlines.
   */
  fs.appendFileSync(fileName, `export const csaAssessmentIds = [\n`);
  for (let index = 0; index < classIds.length; index++) {
    const clsId = classIds[index];
    for (let subIndex = 0; subIndex < subjectIds.length; subIndex++) {
      const subId = subjectIds[subIndex];
      // Prepare the Payload for Creating Class Subject Assessments
      const csaData = JSON.stringify({
        classId: clsId,
        subjectId: subId,
        assessmentId: result.assessment.id,
        state: "ACTIVE",
      });
      // Call the Class Subject API
      const csaResult = await (
        await fetch(api_url + "/class-subject-assessment", {
          ...requestOptions,
          body: csaData,
        })
      ).json();

      fs.appendFileSync(
        fileName,
        `${JSON.stringify({
          assessmentId: result.assessment.id,
          csaId: csaResult.classSubjectAssessment.csaId,
          classId: clsId,
          subjectId: subId,
        })}${
          classIds.length === index + 1 && subjectIds.length === subIndex + 1
            ? ""
            : ","
        } \n`
      );
    }
  }
  fs.appendFileSync(fileName, `]\n`);
};
prepareAssessmentData();
