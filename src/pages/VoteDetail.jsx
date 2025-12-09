// src/pages/VoteDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";

import { getVoteById, submitVote } from "../api/api";
import { getVoterId } from "../utils/voter";

/* 스타일 */
const DateItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active }) => (active ? "#1976d225" : "#fff")};

  &:hover {
    background: #eef5ff;
  }
`;

const MenuItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active }) => (active ? "#ffe0b2" : "#fff")};

  &:hover {
    background: #fff3e0;
  }
`;

const VoteButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 20px;
  font-size: 16px;
`;

const ResultButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 16px;
`;

const HomeButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #444;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 16px;
`;

export default function VoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vote, setVote] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("");

  /* 투표 데이터 가져오기 */
  useEffect(() => {
    async function loadVote() {
      const found = await getVoteById(id);
      setVote(found);
    }
    loadVote();
  }, [id]);

  /* 날짜 선택 */
  const onClickDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  /* 투표 제출 */
  const onSubmitVote = async () => {
    if (selectedDates.length === 0 || !selectedMenu) {
      alert("날짜와 메뉴를 모두 선택해주세요");
      return;
    }

    const voterId = getVoterId(); // UUID 가져오기

    try {
      const result = await submitVote({
        id,
        dates: selectedDates,
        menu: selectedMenu,
        voterId, // 서버에 전달 (중복투표 방지)
      });

      if (result?.message) {
        alert("투표 완료");
        navigate(`/vote/result/${id}`);
      }
    } catch (err) {
      alert("이미 투표한 사용자입니다.");
    }
  };

  /* 이동 관련 함수 */
  const goHome = () => navigate("/");
  const goResult = () => navigate(`/vote/result/${id}`);


  if (!vote) {
    return (
      <PageContainer>
        <p>투표를 찾을 수 없습니다.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h2>투표하기</h2>

      <h3>날짜 선택 (복수 선택 가능)</h3>
      {vote.dates.map((d) => (
        <DateItem
          key={d}
          active={selectedDates.includes(d)}
          onClick={() => onClickDate(d)}
        >
          {d}
        </DateItem>
      ))}

      <h3>메뉴 선택</h3>
      {vote.menuList.map((m) => (
        <MenuItem
          key={m}
          active={selectedMenu === m}
          onClick={() => setSelectedMenu(m)}
        >
          {m}
        </MenuItem>
      ))}

      <VoteButton onClick={onSubmitVote}>투표 제출</VoteButton>
      <ResultButton onClick={goResult}>결과 보기</ResultButton>
      <HomeButton onClick={goHome}>홈으로</HomeButton>
    </PageContainer>
  );
}
