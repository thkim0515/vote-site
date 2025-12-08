import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";

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

export default function VoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vote, setVote] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then((list) => {
        const found = list.find((v) => String(v.id) === id);
        setVote(found);
      });
  }, [id]);

  const onClickDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  const submitVote = async () => {
    if (selectedDates.length === 0 || !selectedMenu) {
      alert("날짜와 메뉴를 모두 선택해주세요");
      return;
    }

    const res = await fetch("http://localhost:4000/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, dates: selectedDates, menu: selectedMenu }),
    });

    if (res.ok) {
      alert("투표 완료");
      navigate(`/vote/result/${id}`); // ✅ 결과 페이지로 이동
    } else {
      alert("투표 실패");
    }
  };

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

      <VoteButton onClick={submitVote}>투표 제출</VoteButton>
    </PageContainer>
  );
}
