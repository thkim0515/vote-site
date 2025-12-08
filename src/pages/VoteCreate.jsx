import { useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";

const hd = new Holidays("KR");

/* ---------------- 스타일 ---------------- */
const Wrap = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;

  .react-calendar {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 8px;
    width: 100%;
  }

  .react-calendar__tile {
    background: #fff !important;
    border: 1px solid #eee;
    min-height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .selected-tile {
    background: #1976d240 !important;
    border: 2px solid #1976d2 !important;
    color: #1976d2 !important;
    font-weight: bold;
  }

  .disabled-tile {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const ChipBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 18px 0;
`;

const Chip = styled.div`
  padding: 6px 10px;
  border-radius: 18px;
  border: 1px solid ${({ active }) => (active ? "#1976d2" : "#666")};
  background: ${({ active }) => (active ? "#1976d225" : "transparent")};
  color: ${({ active }) => (active ? "#1976d2" : "#333")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ChipDelete = styled.span`
  font-weight: bold;
  cursor: pointer;
`;

const InputBox = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #aaa;
  }

  button {
    padding: 10px 14px;
    background: #1976d2;
    color: white;
    border-radius: 6px;
  }
`;

const SaveBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border-radius: 6px;
  margin-top: 25px;
  font-size: 16px;
`;

/* 날짜 포맷 */
const formatDateKey = (date) =>
  date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(".", "");

/* ---------------- 컴포넌트 ---------------- */

export default function VoteCreate() {
  const [step, setStep] = useState(1); // 1: 마감일, 2: 날짜선택, 3: 메뉴입력
  const [deadline, setDeadline] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [menuInput, setMenuInput] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");
  const navigate = useNavigate();

  const todayKey = formatDateKey(new Date());

  // 🔷 타일 비활성화: 오늘 이전 날짜
  const tileDisabled = ({ date }) => {
    const key = formatDateKey(date);
    return key < todayKey;
  };

  // 🔷 타일 클래스 지정
  const tileClassName = ({ date }) => {
    const key = formatDateKey(date);
    if (key < todayKey) return "disabled-tile";
    if (step === 1 && deadline === key) return "selected-tile";
    if (step === 2 && selectedDates.includes(key)) return "selected-tile";
    return "";
  };

  const onClickDay = (date) => {
    const key = formatDateKey(date);
    if (key < todayKey) return;

    if (step === 1) {
      setDeadline(key);
    }

    if (step === 2) {
      // 마감일 이후는 선택 불가
      if (deadline && key > deadline) return;

      if (selectedDates.includes(key)) {
        setSelectedDates(selectedDates.filter((d) => d !== key));
      } else {
        setSelectedDates([...selectedDates, key]);
      }
    }
  };

  const addMenu = () => {
    if (!menuInput.trim()) return;
    const newMenu = menuInput.trim();
    setMenuList([...menuList, newMenu]);
    setSelectedMenu(newMenu);
    setMenuInput("");
  };

  const handleMenuKeyDown = (e) => {
    if (e.key === "Enter") addMenu();
  };

  const saveVote = async () => {
    if (!deadline || selectedDates.length === 0 || !selectedMenu) {
      alert("모든 항목을 입력해주세요");
      return;
    }

    const voteData = {
      id: Date.now(),
      deadline,
      dates: selectedDates,
      menuList,
      selectedMenu,
      results: {},
    };

    try {
      const res = await fetch("http://localhost:4000/api/saveVote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voteData),
      });

      if (res.ok) {
        alert("저장 완료");
        navigate(`/vote/detail/${voteData.id}`);
      } else {
        alert("저장 실패");
      }
    } catch {
      alert("통신 실패");
    }
  };

  return (
    <PageContainer>
      <Wrap>
        <h2>투표 만들기</h2>

        {step === 1 && (
          <>
            <h3>1단계: 마감 날짜를 선택해주세요</h3>
            <Calendar
              locale="ko-KR"
              calendarType="gregory"
              onClickDay={onClickDay}
              tileClassName={tileClassName}
              tileDisabled={tileDisabled}
            />
            {deadline && (
              <div style={{ marginTop: 20 }}>
                <p>선택된 마감일: {deadline}</p>
                <SaveBtn onClick={() => setStep(2)}>다음</SaveBtn>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3>2단계: 투표 대상 날짜를 선택해주세요</h3>
            <Calendar
              locale="ko-KR"
              calendarType="gregory"
              onClickDay={onClickDay}
              tileClassName={tileClassName}
              tileDisabled={tileDisabled}
            />

            <ChipBox>
              {selectedDates.map((d) => (
                <Chip key={d} active>
                  {d}
                  <ChipDelete
                    onClick={() =>
                      setSelectedDates(selectedDates.filter((x) => x !== d))
                    }
                  >
                    ×
                  </ChipDelete>
                </Chip>
              ))}
            </ChipBox>

            <SaveBtn
              onClick={() => setStep(3)}
              disabled={selectedDates.length === 0}
            >
              다음
            </SaveBtn>
          </>
        )}

        {step === 3 && (
          <>
            <h3>3단계: 메뉴를 입력해주세요</h3>

            <InputBox>
              <input
                value={menuInput}
                onChange={(e) => setMenuInput(e.target.value)}
                onKeyDown={handleMenuKeyDown}
                placeholder="메뉴 입력"
              />
              <button onClick={addMenu}>추가</button>
            </InputBox>

            <ChipBox>
              {menuList.map((m) => (
                <Chip
                  key={m}
                  active={selectedMenu === m}
                  onClick={() => setSelectedMenu(m)}
                >
                  {m}
                  <ChipDelete
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuList(menuList.filter((x) => x !== m));
                      if (selectedMenu === m) setSelectedMenu("");
                    }}
                  >
                    ×
                  </ChipDelete>
                </Chip>
              ))}
            </ChipBox>

            <SaveBtn onClick={saveVote}>투표 저장하기</SaveBtn>
          </>
        )}
      </Wrap>
    </PageContainer>
  );
}
