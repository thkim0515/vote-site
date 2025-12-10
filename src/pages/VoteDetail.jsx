// src/pages/VoteDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";

import { getVoteById, submitVote } from "../api/api";
import { getVoterId } from "../utils/voter";

/* 스타일 */
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ShareButton = styled.button`
  padding: 8px 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
`;

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

  const voterId = getVoterId();

  /* 투표 데이터 가져오기 + 이미 참여한 사람 처리 */
  useEffect(() => {
    async function loadVote() {
      const found = await getVoteById(id);
      if (!found) return;

      let voters = [];

      // voters가 배열일 때
      if (Array.isArray(found.voters)) {
        voters = found.voters;
      }

      // voters가 객체일 때
      else if (found.voters && typeof found.voters === "object") {
        voters = Object.keys(found.voters);
      }

      // 이미 투표한 사용자 체크
      if (voters.includes(voterId)) {
        alert("이미 투표를 진행하였습니다.");
        setTimeout(() => navigate(`/vote/result/${id}`), 0);
        return;
      }

      setVote(found);
    }

    loadVote();
  }, [id]);


  /* 날짜 선택 */
  const onClickDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((item) => item !== date)
        : [...prev, date]
    );
  };

  /* 공유하기 */
  const share = async () => {
    const url = `${window.location.origin}/vote/detail/${id}`;
    const text = `투표하세요!\n\n${url}`;

    // 1) clipboard API 지원 시
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        alert("투표 링크가 복사되었습니다.");
        return;
      } catch (e) {
        // clipboard API 실패 → fallback
      }
    }

    // 2) Fallback: execCommand 방식
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (success) {
      alert("투표 링크가 복사되었습니다.");
    } else {
      alert("복사가 지원되지 않는 환경입니다. 직접 복사해주세요.");
    }
  };


  /* 투표 제출 */
  const onSubmitVote = async () => {
    if (selectedDates.length === 0 || !selectedMenu) {
      alert("날짜와 메뉴를 모두 선택해주세요");
      return;
    }

    try {
      const result = await submitVote({
        id,
        dates: selectedDates,
        menu: selectedMenu,
        voterId,
      });

      if (result?.message) {
        alert("투표 완료");
        navigate(`/vote/result/${id}`);
      }
    } catch {
      alert("이미 투표한 사용자입니다.");
    }
  };

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
      <Header>
        <h2>투표하기</h2>
        <ShareButton onClick={share}>공유</ShareButton>
      </Header>

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
