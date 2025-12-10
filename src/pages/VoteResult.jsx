// src/pages/VoteResult.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

import { getVoteById } from "../api/api";

/* 공유 아이콘 (MIT License) */
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="18"
    height="18"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 12a4.5 4.5 0 018.243-2.121l3.257 3.257a4.5 4.5 0 11-1.414 1.414l-3.257-3.257A4.5 4.5 0 017.5 12z"
    />
  </svg>
);

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
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RankCard = styled.div`
  padding: 16px;
  background: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 40px;
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
`;

export default function VoteResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);

  const goHome = () => navigate("/");

  /* 투표 데이터 가져오기 */
  useEffect(() => {
    async function loadVote() {
      const data = await getVoteById(id);
      setVote(data);
    }
    loadVote();
  }, [id]);

  if (!vote) {
    return (
      <PageContainer>
        <p>결과 데이터를 불러올 수 없습니다.</p>
      </PageContainer>
    );
  }

  /* 1위 계산 함수 */
  const getFirstRank = (obj = {}) => {
    const arr = Object.entries(obj)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return arr[0] || null;
  };

  const dateFirst = getFirstRank(vote.results?.dates);
  const menuFirst = getFirstRank(vote.results?.menus);

  /* 차트 데이터 */
  const dateChartData = (vote.dates || []).map((date) => ({
    name: date,
    value: vote.results?.dates?.[date] || 0,
  }));

  const menuChartData = (vote.menuList || []).map((menu) => ({
    name: menu,
    value: vote.results?.menus?.[menu] || 0,
  }));

  const colors = ["#1976d2", "#ff9800", "#4caf50", "#e91e63", "#9c27b0"];

  /* 공유 기능: 텍스트 복사 */
  const share = async () => {
    const url = `${window.location.origin}/vote/result/${id}`;

    const text = `투표 결과 안내\n\n날짜 1위: ${
      dateFirst ? `${dateFirst.name} (${dateFirst.value}표)` : "없음"
    }\n메뉴 1위: ${
      menuFirst ? `${menuFirst.name} (${menuFirst.value}표)` : "없음"
    }\n\n결과 자세히 보기: ${url}`;

    // 1) 최신 브라우저에서 clipboard API 지원 시
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        alert("결과 정보가 클립보드에 복사되었습니다.");
        return;
      } catch (e) {
        // 실패 시 아래 fallback 실행
      }
    }

    // 2) Fallback: textarea를 만들어 복사
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (copied) {
      alert("결과 정보가 클립보드에 복사되었습니다.");
    } else {
      alert("복사를 지원하지 않는 환경입니다. 직접 복사해주세요.");
    }
  };


  return (
    <PageContainer>
      <Header>
        <h2>투표 결과</h2>
        <ShareButton onClick={share}>
          공유
        </ShareButton>
      </Header>

      <RankCard>
        <h3>요약 결과</h3>

        <p>
          <strong>날짜 1위:</strong>{" "}
          {dateFirst ? `${dateFirst.name} (${dateFirst.value}표)` : "없음"}
        </p>

        <p style={{ marginTop: "12px" }}>
          <strong>메뉴 1위:</strong>{" "}
          {menuFirst ? `${menuFirst.name} (${menuFirst.value}표)` : "없음"}
        </p>
      </RankCard>

      {/* 날짜 차트 */}
      <Section>
        <h3>날짜 인기 순위</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dateChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              <LabelList dataKey="value" position="top" />
              {dateChartData.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* 메뉴 차트 */}
      <Section>
        <h3>메뉴 인기 순위</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={menuChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              <LabelList dataKey="value" position="top" />
              {menuChartData.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <HomeButton onClick={goHome}>홈으로</HomeButton>
    </PageContainer>
  );
}