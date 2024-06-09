import http from "k6/http";
import { check } from "k6";
import { configurations } from "./config.js";
export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 100,
  // A string specifying the total duration of the test run.
  // duration: "1s",
};

export default function () {
  const { api_url, studentIds } = configurations[__ENV.ENVIRONMENT_NAME];
  const url = api_url + "/attendances/submit";

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "SubmitAttendance" },
  };

  for (let id = 1; id <= 1000; id++) {
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
    const res = http.post(url, payload, params);
    check(res, {
      "is status 200": (r) => r.status === 200,
      "is success": (r) =>
        r.body && res.json().submitManyAttendances.success === true,
    });
  }
}
