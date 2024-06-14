import http from "k6/http";
import exec from "k6/execution";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { configurations } from "./config.js";

const virtualUsers = 15;
let numberOfIterations = 0;
const data = new SharedArray("assessment_dataset", function () {
  const payloads = [];
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const csaAssessmentIds = JSON.parse(open("./prepared_csa_ids.json"));
  const { studentIds, questionIds } = configurations[__ENV.ENVIRONMENT_NAME];
  const today = new Date();
  const epochDate = Math.floor(today.getTime() / 1000);
  for (let id = 1; id <= csaAssessmentIds.length; id++) {
    const { assessmentId, csaId, classId, subjectId } =
      csaAssessmentIds[id - 1];
    for (const questionId of questionIds) {
      const assessmentSubmitPayload = {
        csaId: csaId,
        classId: classId,
        subjectId,
        assessmentId: assessmentId,
        status: "ACTIVE",
        starts: epochDate,
        ends: epochDate,
        assessmentResponsePayloads: studentIds.map((studentId) => ({
          assessmentResponse: {
            assessmentId: assessmentId,
            csaId: csaId,
            studentId: studentId,
            createdAt: epochDate,
            updatedBy: 1,
            updatedByTeacher: 1,
          },
          assessmentResponseDetails: [
            {
              csaId,
              questionId,
              response: String(randomIntFromInterval(1, 6)),
              createdAt: epochDate,
              updatedBy: 1,
              updatedByTeacher: 1,
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
  const numberOfCalls =
    csaAssessmentIds.length *
    configurations[__ENV.ENVIRONMENT_NAME].questionIds.length;
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
    "is success": (r) =>
      r.body && res.json().submitManyAssessmentResponses.success === true,
  });
  sleep(1);
}
