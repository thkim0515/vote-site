// src/utils/voter.js

export function getVoterId() {
  let id = localStorage.getItem("voterId");

  if (!id) {
    // 브라우저가 crypto.randomUUID를 지원할 경우
    if (crypto && typeof crypto.randomUUID === "function") {
      id = crypto.randomUUID();
    } else {
      // 지원하지 않으면 직접 UUID 생성 (폴백)
      id = "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    localStorage.setItem("voterId", id);
  }

  return id;
}
