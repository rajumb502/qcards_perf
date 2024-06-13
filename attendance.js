import http from "k6/http";
import exec from "k6/execution";
import { check } from "k6";
import { SharedArray } from "k6/data";
import { configurations } from "./config.js";

const data = new SharedArray("attendance_dataset", function () {
  const payloads = [];
  const { api_url, studentIds } = configurations[__ENV.ENVIRONMENT_NAME];
  for (let id = 1; id <= 10; id++) {
    const today = new Date();
    today.setDate(today.getDate() + id);
    const epochDate = Math.floor(today.getTime() / 1000);
    const payload = JSON.stringify({
      payload: studentIds.map((studentId) => ({
        sessionId: 1,
        studentId: studentId,
        ayId: 1,
        date: epochDate,
        attendance: "PRESENT",
      })),
    });
    payloads.push(payload);
  }

  return payloads;
});

export const options = {
  // A number specifying the number of VUs to run concurrently.
  // vus: 1,
  // A string specifying the total duration of the test run.
  // duration: "1s",
  scenarios: {
    stress_test: {
      executor: "per-vu-iterations",
      vus: 6,
      iterations: 1,
      // maxDuration: "30s",
    },
  },
};

export default function () {
  const payload = data[exec.scenario.iterationInTest];
  const { api_url } = configurations[__ENV.ENVIRONMENT_NAME];
  const url = api_url + "/attendances/submit";

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "SubmitAttendance" },
  };

  const res = http.post(url, payload, params);
  check(res, {
    "is status 200": (r) => r.status === 200,
    "is success": (r) =>
      r.body && res.json().submitManyAttendances.success === true,
  });
}
