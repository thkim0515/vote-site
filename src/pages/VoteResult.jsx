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

/* 스타일 */
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

  /* 투표 데이터 가져오기 (api.js 사용) */
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

  /* 차트 데이터 준비 */
  const dateChartData = (vote.dates || []).map((date) => ({
    name: date,
    value: vote.results?.dates?.[date] || 0,
  }));

  const menuChartData = (vote.menuList || []).map((menu) => ({
    name: menu,
    value: vote.results?.menus?.[menu] || 0,
  }));

  const colors = [
    "#1976d2",
    "#ff9800",
    "#4caf50",
    "#e91e63",
    "#9c27b0",
    "#009688",
  ];

  return (
    <PageContainer>
      <h2>투표 결과</h2>

      <Section>
        <h3>날짜 인기 순위</h3>
        {dateChartData.length === 0 ? (
          <p>날짜 항목이 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
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
        )}
      </Section>

      <Section>
        <h3>메뉴 인기 순위</h3>
        {menuChartData.length === 0 ? (
          <p>메뉴 항목이 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
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
        )}
      </Section>

      <HomeButton onClick={goHome}>홈으로</HomeButton>
    </PageContainer>
  );
}
