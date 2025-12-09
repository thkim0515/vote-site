import { useState } from "react";
import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";
import { saveVote } from "../api/api";

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

  /* 인접 달 날짜는 연하게 표시 */
  .neighbor-tile {
    opacity: 0.35 !important;
    color: #999 !important;
  }

  /* 일요일 빨간색 */
  .sunday-tile {
    color: #ff1744 !important;
    font-weight: bold;
  }

  /* 공휴일 빨간색 */
  .holiday-tile {
    color: #d50000 !important;
    font-weight: bold;
  }

  /* 토요일 파란색 */
  .saturday-tile {
    color: #1976d2 !important;
    font-weight: bold;
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

const HomeButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #444;
  color: white;
  border-radius: 6px;
  margin-top: 20px;
  font-size: 16px;
`;

/* ---------------- 날짜 포맷 ---------------- */
const days = ["일", "월", "화", "수", "목", "금", "토"];

const formatDateKey = (date) =>
  date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(".", "");

const formatDateWithDay = (date) => {
  const base = formatDateKey(date);
  const day = days[date.getDay()];
  return `${base} (${day})`;
};

/* ---------------- 컴포넌트 ---------------- */
export default function VoteCreate() {
  const [step, setStep] = useState(1);
  const [deadline, setDeadline] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [menuInput, setMenuInput] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");

  const navigate = useNavigate();
  const goHome = () => navigate("/");

  const todayKey = formatDateKey(new Date());

  /* ---------------- 날짜 스타일 지정 ---------------- */
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const baseKey = formatDateKey(date);
    const holiday = hd.isHoliday(date);
    const today = new Date();

    const classes = [];

    /* 1. 인접 달 날짜 → 연하게 (색상 적용 금지) */
    if (date.getMonth() !== today.getMonth()) {
      classes.push("neighbor-tile");
      return classes.join(" "); // 인접달은 나머지 색상 무조건 비활성
    }

    /* 2. 지난 날짜 */
    if (baseKey < todayKey) {
      classes.push("disabled-tile");
      return classes.join(" ");
    }

    /* 3. 공휴일 */
    if (holiday) {
      classes.push("holiday-tile");
    } 
    /* 4. 일요일 */
    else if (date.getDay() === 0) {
      classes.push("sunday-tile");
    } 
    /* 5. 토요일 */
    else if (date.getDay() === 6) {
      classes.push("saturday-tile");
    }

    /* 6. 선택된 날짜 */
    if (step === 1 && deadline?.startsWith(baseKey)) {
      classes.push("selected-tile");
    }

    if (step === 2 && selectedDates.some((d) => d.startsWith(baseKey))) {
      classes.push("selected-tile");
    }

    return classes.join(" ");
  };


  const tileDisabled = ({ date }) => formatDateKey(date) < todayKey;

  const onClickDay = (date) => {
    const baseKey = formatDateKey(date);
    const fullKey = formatDateWithDay(date);

    if (baseKey < todayKey) return;

    if (step === 1) {
      setDeadline(fullKey);
      return;
    }

    if (step === 2) {
      setSelectedDates((prev) =>
        prev.includes(fullKey)
          ? prev.filter((d) => d !== fullKey)
          : [...prev, fullKey]
      );
    }
  };

  const addMenu = () => {
    if (!menuInput.trim()) return;
    const newMenu = menuInput.trim();
    setMenuList([...menuList, newMenu]);
    setSelectedMenu(newMenu);
    setMenuInput("");
  };

  const saveVoteHandler = async () => {
    const voteData = {
      deadline,
      dates: selectedDates,
      menuList,
    };

    const result = await saveVote(voteData);
    navigate(`/vote/detail/${result.id}`);
  };

  return (
    <PageContainer>
      <Wrap>
        <h2>투표 만들기</h2>

        {/* STEP 1 */}
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

            <HomeButton onClick={goHome}>홈으로</HomeButton>
          </>
        )}

        {/* STEP 2 */}
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
                if (selectedDates.length <= 1) {
                  alert("날짜는 2개 이상 선택해주세요.");
                  return;
                }
                setStep(3);
              }}
              disabled={selectedDates.length === 0}
            >
              다음
            </SaveBtn>

            <HomeButton onClick={goHome}>홈으로</HomeButton>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h3>3단계: 메뉴를 입력해주세요</h3>

            <InputBox>
              <input
                value={menuInput}
                onChange={(e) => setMenuInput(e.target.value)}
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

            <HomeButton onClick={goHome}>홈으로</HomeButton>
          </>
        )}
      </Wrap>
    </PageContainer>
  );
}
