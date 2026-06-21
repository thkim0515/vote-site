import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "allowance-ledger";

/* ---------------- 스타일 ---------------- */
const SummaryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  flex: 1;
  padding: 12px 8px;
  border-radius: 10px;
  background: ${({ bg }) => bg || "#f5f5f5"};
  text-align: center;

  .label {
    font-size: 12px;
    color: ${({ color }) => color || "#666"};
    margin-bottom: 4px;
  }

  .value {
    font-size: 15px;
    font-weight: bold;
    color: ${({ color }) => color || "#333"};
  }
`;

const ToggleRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const CategoryToggle = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid ${({ active, color }) => (active ? color : "#ccc")};
  background: ${({ active, color }) => (active ? color + "20" : "#fff")};
  color: ${({ active, color }) => (active ? color : "#999")};
`;

const FormWrap = styled.div`
  background: #f9f9f9;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;

  input {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #aaa;
    margin-bottom: 12px;
    box-sizing: border-box;
    font-size: 14px;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
`;

const ToggleFormButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${({ open }) => (open ? "#eee" : "#1976d2")};
  color: ${({ open }) => (open ? "#333" : "white")};
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 20px;
`;

const EntryRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  gap: 8px;
`;

const EntryInfo = styled.div`
  flex: 1;
  min-width: 0;

  .top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
  }

  .date {
    font-size: 12px;
    color: #999;
  }

  .desc {
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  color: white;
  background: ${({ type }) => (type === "수입" ? "#1976d2" : "#e91e63")};
`;

const AmountCol = styled.div`
  text-align: right;
  min-width: 80px;

  .amount {
    font-size: 14px;
    font-weight: bold;
    color: ${({ type }) => (type === "수입" ? "#1976d2" : "#e91e63")};
  }

  .balance {
    font-size: 11px;
    color: #999;
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #bbb;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #e91e63;
  }
`;

const HomeButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #444;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 20px;
  font-size: 16px;
  cursor: pointer;
`;

const EmptyMsg = styled.p`
  text-align: center;
  color: #999;
  padding: 30px 0;
`;

/* ---------------- 유틸 ---------------- */
const todayStr = () => new Date().toISOString().slice(0, 10);

const formatAmount = (n) => n.toLocaleString("ko-KR");

/* ---------------- 컴포넌트 ---------------- */
export default function AllowanceLedger() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [date, setDate] = useState(todayStr);
  const [category, setCategory] = useState("수입");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const totalIncome = useMemo(
    () =>
      entries
        .filter((e) => e.category === "수입")
        .reduce((s, e) => s + e.amount, 0),
    [entries]
  );

  const totalExpense = useMemo(
    () =>
      entries
        .filter((e) => e.category === "지출")
        .reduce((s, e) => s + e.amount, 0),
    [entries]
  );

  const balance = totalIncome - totalExpense;

  const entriesWithBalance = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.createdAt - b.createdAt;
    });

    let running = 0;
    const balanceMap = new Map();
    sorted.forEach((e) => {
      running += e.category === "수입" ? e.amount : -e.amount;
      balanceMap.set(e.id, running);
    });

    return entries.map((e) => ({ ...e, balance: balanceMap.get(e.id) }));
  }, [entries]);

  const addEntry = () => {
    if (!date) {
      alert("날짜를 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    const num = Number(amount);
    if (!num || num <= 0) {
      alert("금액을 올바르게 입력해주세요.");
      return;
    }

    const newEntry = {
      id: Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      date,
      category,
      description: description.trim(),
      amount: num,
      createdAt: Date.now(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setDescription("");
    setAmount("");
    setShowForm(false);
  };

  const deleteEntry = (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <PageContainer>
      <h2 style={{ textAlign: "center" }}>용돈기입장</h2>

      <SummaryRow>
        <SummaryCard color="#1976d2" bg="#1976d210">
          <div className="label">총 수입</div>
          <div className="value">+{formatAmount(totalIncome)}원</div>
        </SummaryCard>
        <SummaryCard color="#e91e63" bg="#e91e6310">
          <div className="label">총 지출</div>
          <div className="value">-{formatAmount(totalExpense)}원</div>
        </SummaryCard>
        <SummaryCard
          color={balance >= 0 ? "#4caf50" : "#e91e63"}
          bg={balance >= 0 ? "#4caf5010" : "#e91e6310"}
        >
          <div className="label">잔액</div>
          <div className="value">{formatAmount(balance)}원</div>
        </SummaryCard>
      </SummaryRow>

      <ToggleFormButton
        open={showForm}
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? "닫기" : "+ 새 항목 추가"}
      </ToggleFormButton>

      {showForm && (
        <FormWrap>
          <label style={{ fontSize: 13, color: "#666" }}>날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label style={{ fontSize: 13, color: "#666" }}>분류</label>
          <ToggleRow>
            <CategoryToggle
              active={category === "수입"}
              color="#1976d2"
              onClick={() => setCategory("수입")}
            >
              수입
            </CategoryToggle>
            <CategoryToggle
              active={category === "지출"}
              color="#e91e63"
              onClick={() => setCategory("지출")}
            >
              지출
            </CategoryToggle>
          </ToggleRow>

          <label style={{ fontSize: 13, color: "#666" }}>내용</label>
          <input
            type="text"
            placeholder="예: 용돈, 문구점"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label style={{ fontSize: 13, color: "#666" }}>금액</label>
          <input
            type="number"
            placeholder="금액 입력"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />

          <AddButton onClick={addEntry}>추가하기</AddButton>
        </FormWrap>
      )}

      <h3>거래 내역</h3>

      {entriesWithBalance.length === 0 ? (
        <EmptyMsg>등록된 내역이 없습니다.</EmptyMsg>
      ) : (
        entriesWithBalance.map((e) => (
          <EntryRow key={e.id}>
            <EntryInfo>
              <div className="top">
                <span className="date">{e.date}</span>
                <CategoryBadge type={e.category}>{e.category}</CategoryBadge>
              </div>
              <div className="desc">{e.description}</div>
            </EntryInfo>
            <AmountCol type={e.category}>
              <div className="amount">
                {e.category === "수입" ? "+" : "-"}
                {formatAmount(e.amount)}원
              </div>
              <div className="balance">잔액 {formatAmount(e.balance)}원</div>
            </AmountCol>
            <DeleteBtn onClick={() => deleteEntry(e.id)}>×</DeleteBtn>
          </EntryRow>
        ))
      )}

      <HomeButton onClick={() => navigate("/")}>홈으로</HomeButton>
    </PageContainer>
  );
}
