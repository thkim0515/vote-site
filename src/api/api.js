// const BASE_URL = "http://localhost:4000/api";
const BASE_URL = "http://192.168.122.81:4000/api";


/* -----------------------------
   공통 fetch 래퍼 함수
------------------------------ */
async function request(url, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${url}`, options);

  if (!res.ok) {
    throw new Error(`API 오류: ${res.status}`);
  }

  return res.json();
}

/* -----------------------------
   실제 API 함수 목록
------------------------------ */

// 투표 생성
export const saveVote = (voteData) =>
  request("/saveVote", "POST", voteData);

// 전체 투표 목록 조회
export const getVotes = () =>
  request("/getVotes", "GET");

// 특정 투표 조회
export const getVoteById = async (id) => {
  const votes = await getVotes();
  return votes.find((v) => String(v.id) === String(id));
};

// 투표 제출
export const submitVote = (data) =>
  request("/vote", "POST", data);

export default {
  saveVote,
  getVotes,
  getVoteById,
  submitVote,
};
