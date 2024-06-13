import http from "k6/http";
import { check } from "k6";
import { configurations } from "./config.js";
import { csaAssessmentIds } from "./prepared_csa_ids.js";
// import csaAssessmentIds from "./assessment_ids.json";
export const options = {
  vus: 1,
  iterations: 1,
  duration: "1h",
};

export default async function () {
  const { api_url, studentIds, questionIds } =
    configurations[__ENV.ENVIRONMENT_NAME];
  const url = api_url + "/assessments/responses/submit";
  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  console.log("csaAssessmentIds", csaAssessmentIds);
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "SubmitAssessments" },
  };
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

      const res = http.post(url, payload, params);
      check(res, {
        "is status 200": (r) => r.status === 200,
        "is success": (r) =>
          r.body && res.json().submitManyAssessmentResponses.success === true,
      });
    }
  }
}
