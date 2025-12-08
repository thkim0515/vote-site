import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const Section = styled.div`
  margin-bottom: 40px;
`;

export default function VoteResult() {
  const { id } = useParams();
  const [vote, setVote] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then((list) => {
        const found = list.find((v) => String(v.id) === id);
        setVote(found);
      });
  }, [id]);

  if (!vote) {
    return (
      <PageContainer>
        <p>결과 데이터를 불러올 수 없습니다.</p>
      </PageContainer>
    );
  }

  // 날짜 데이터 (0개도 포함해서)
  const dateChartData = (vote.dates || []).map((date) => ({
    name: date,
    value: vote.results?.dates?.[date] || 0,
  }));

  // 메뉴 데이터 (0개도 포함해서)
  const menuChartData = (vote.menuList || []).map((menu) => ({
    name: menu,
    value: vote.results?.menus?.[menu] || 0,
  }));

  const colors = ["#1976d2", "#ff9800", "#4caf50", "#e91e63", "#9c27b0", "#009688"];

  return (
    <PageContainer>
      <h2>투표 결과</h2>

      <Section>
        <h3>날짜 인기 순위</h3>
        {dateChartData.length === 0 ? (
          <p>날짜 항목이 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
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
          <ResponsiveContainer width="100%" height={300}>
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
    </PageContainer>
  );
}
