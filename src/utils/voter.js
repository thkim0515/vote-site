// src/utils/voter.js

export function getVoterId() {
  let id = localStorage.getItem("voterId");
  if (!id) {
    id = crypto.randomUUID(); // 브라우저 내장 랜덤 UUID
    localStorage.setItem("voterId", id);
  }
  return id;
}
