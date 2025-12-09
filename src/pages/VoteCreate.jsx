import { useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";
import { saveVote } from "../api/api";   // ← api.js 함수 불러오기

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
  flex-direction: column;
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
  justify-content: space-between;
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

/* ---------------- 날짜 포맷 ---------------- */
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
  const [step, setStep] = useState(1);
  const [deadline, setDeadline] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [menuInput, setMenuInput] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");

  const navigate = useNavigate();

  const todayKey = formatDateKey(new Date());

  /* ---- 캘린더 타일 비활성화 ---- */
  const tileDisabled = ({ date }) => {
    const key = formatDateKey(date);
    return key < todayKey;
  };

  /* ---- 타일 스타일 ---- */
  const tileClassName = ({ date }) => {
    const key = formatDateKey(date);
    if (key < todayKey) return "disabled-tile";
    if (step === 1 && deadline === key) return "selected-tile";
    if (step === 2 && selectedDates.includes(key)) return "selected-tile";
    return "";
  };

  /* ---- 날짜 클릭 ---- */
  const onClickDay = (date) => {
    const key = formatDateKey(date);
    if (key < todayKey) return;

    if (step === 1) {
      setDeadline(key);
    }

    if (step === 2) {
      if (selectedDates.includes(key)) {
        setSelectedDates(selectedDates.filter((d) => d !== key));
      } else {
        setSelectedDates([...selectedDates, key]);
      }
    }
  };

  /* ---- 메뉴 입력 ---- */
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

  /* ---- 투표 저장 제출(api.js 사용) ---- */
  const saveVoteHandler = async () => {
    const voteData = {
      deadline,
      dates: selectedDates,
      menuList,
    };

    try {
      const result = await saveVote(voteData);  // ← api.js 호출
      navigate(`/vote/detail/${result.id}`);
    } catch {
      alert("저장 실패");
    }
  };

  /* ---------------- 렌더링 ---------------- */
  return (
    <PageContainer>
      <Wrap>
        <h2>투표 만들기</h2>

        {/* 1단계 ― 마감 날짜 선택 */}
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

        {/* 2단계 ― 날짜 선택 */}
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
              onClick={() => {
                if (selectedDates.length === 1) {
                  alert("날짜는 2개 이상 선택해야 합니다.");
                  return;
                }
                setStep(3);
              }}
              disabled={selectedDates.length === 0}
            >
              다음
            </SaveBtn>
          </>
        )}

        {/* 3단계 ― 메뉴 입력 */}
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

            <SaveBtn onClick={saveVoteHandler}>투표 저장하기</SaveBtn>
          </>
        )}
      </Wrap>
    </PageContainer>
  );
}
