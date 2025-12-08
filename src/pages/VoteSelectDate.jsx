import { useEffect, useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import PageContainer from "../components/PageContainer";

const VoteBox = styled.div`
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const MenuButton = styled.button`
  margin: 6px;
  padding: 10px 16px;
  border: 1px solid #1976d2;
  border-radius: 6px;
  background: ${({ selected }) => (selected ? "#1976d2" : "white")};
  color: ${({ selected }) => (selected ? "white" : "#1976d2")};
  cursor: pointer;
`;

export default function VoteSelectDate() {
  const [votes, setVotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredVotes, setFilteredVotes] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState({}); // { voteId: "선택된 메뉴" }

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then(setVotes)
      .catch(() => alert("투표 데이터를 불러오는 데 실패했습니다."));
  }, []);

  // 날짜 변경 시 해당 날짜 투표만 필터링
  const handleDateChange = (date) => {
    const dateStr = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, "-").replace(".", "");

    setSelectedDate(dateStr);

    const matches = votes.filter((v) => v.dates.includes(dateStr));
    setFilteredVotes(matches);
  };

  // 투표 저장 (선택 결과만 저장)
  const handleVoteSubmit = async (voteId, selectedMenu) => {
    if (!selectedMenu) return alert("메뉴를 선택해주세요");

    try {
      const res = await fetch("http://localhost:4000/api/saveVote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...votes.find((v) => v.id === voteId),
          results: {
            ...(votes.find((v) => v.id === voteId)?.results || {}),
            you: selectedMenu,
          },
        }),
      });

      if (res.ok) {
        alert("투표 완료");
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      alert("통신 오류");
    }
  };

  return (
    <PageContainer>
      <h2>날짜를 선택하세요</h2>
      <Calendar
        locale="ko-KR"
        calendarType="gregory"
        onClickDay={handleDateChange}
      />

      {selectedDate && (
        <div style={{ marginTop: "20px" }}>
          <h3>{selectedDate} 투표</h3>

          {filteredVotes.length === 0 ? (
            <p>선택된 날짜에 해당하는 투표가 없습니다.</p>
          ) : (
            filteredVotes.map((vote) => (
              <VoteBox key={vote.id}>
                <h4>메뉴 투표</h4>
                {vote.menu && (
                  <MenuButton
                    selected={selectedMenus[vote.id] === vote.menu}
                    onClick={() =>
                      setSelectedMenus((prev) => ({
                        ...prev,
                        [vote.id]: vote.menu,
                      }))
                    }
                  >
                    {vote.menu}
                  </MenuButton>
                )}
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={() =>
                      handleVoteSubmit(vote.id, selectedMenus[vote.id])
                    }
                  >
                    투표 제출
                  </button>
                </div>
              </VoteBox>
            ))
          )}
        </div>
      )}
    </PageContainer>
  );
}
