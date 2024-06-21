import http from "k6/http";
import exec from "k6/execution";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { configurations } from "./config.js";

const virtualUsers = 30;
let numberOfIterations = 0;
const data = new SharedArray("assessment_dataset", function () {
  const payloads = [];
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const csaAssessmentIds = JSON.parse(
    open("./prepared_csas_with_assessments_and_students.json")
  );
  const today = new Date();
  const epochDate = Math.floor(today.getTime() / 1000);
  let numberOfCalls = 0;
  for (let id = 1; id <= csaAssessmentIds.length; id++) {
    const {
      assessment_id,
      csa_id,
      class_id,
      subject_id,
      student_ids,
      question_ids,
    } = csaAssessmentIds[id - 1];
    numberOfCalls += question_ids.length;
    for (const questionId of question_ids) {
      const assessmentSubmitPayload = {
        csaId: csa_id,
        classId: class_id,
        subjectId: subject_id,
        assessmentId: assessment_id,
        status: "ACTIVE",
        starts: epochDate,
        ends: epochDate,
        assessmentResponsePayloads: student_ids.map((studentId) => ({
          assessmentResponse: {
            assessmentId: assessment_id,
            csaId: csa_id,
            studentId: studentId,
            createdAt: epochDate,
            updatedBy: "979399660342870017",
            updatedByTeacher: "979399660342870017",
          },
          assessmentResponseDetails: [
            {
              csaId: csa_id,
              questionId,
              response: String(randomIntFromInterval(1, 6)),
              createdAt: epochDate,
              updatedBy: "979399660342870017",
              updatedByTeacher: "979399660342870017",
            },
          ],
        })),
      };
      const payload = JSON.stringify({
        payload: assessmentSubmitPayload,
      });
      payloads.push(payload);
    }
  }

  numberOfIterations = Math.round(numberOfCalls / virtualUsers);
  console.log(
    payloads.length,
    "**** Pay load Length*******",
    numberOfIterations,
    virtualUsers
  );
  return payloads;
});

export const options = {
  scenarios: {
    stress_test: {
      executor: "per-vu-iterations",
      vus: virtualUsers,
      iterations: numberOfIterations,
      maxDuration: "30m",
    },
  },
};
export default async function () {
  const payload = data[exec.scenario.iterationInTest];
  const { api_url } = configurations[__ENV.ENVIRONMENT_NAME];
  const url = api_url + "/assessments/responses/submit";
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "SubmitAssessments" },
  };
  const res = http.post(url, payload, params);
  check(res, {
    "is status 200": (r) => r.status === 200,
    "is success": (r) => {
      return (
        r.body && res.json().submitManyAssessmentResponses.success === true
      );
    },
  });
  sleep(1);
}
