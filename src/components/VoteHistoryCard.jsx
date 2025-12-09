// src/components/VoteHistoryCard.jsx

import { useState } from "react";
import styled from "styled-components";
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

const Card = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
`;

const Header = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

/* 부드럽게 열리는 아코디언 컨테이너 */
const AnimatedContent = styled.div`
  max-height: ${({ open }) => (open ? "800px" : "0px")};
  overflow: hidden;
  transition: max-height 0.4s ease;
`;

const Content = styled.div`
  margin-top: 16px;
  border-top: 1px solid #ccc;
  padding-top: 16px;
`;

export default function VoteHistoryCard({ vote }) {
  const [open, setOpen] = useState(false);

  const dateChartData = (vote.dates || []).map((d) => ({
    name: d,
    value: vote.results?.dates?.[d] || 0,
  }));

  const menuChartData = (vote.menuList || []).map((m) => ({
    name: m,
    value: vote.results?.menus?.[m] || 0,
  }));

  const colors = ["#1976d2", "#ff9800", "#4caf50", "#e91e63", "#9c27b0"];

  return (
    <Card onClick={() => setOpen(!open)}>
      <Header>{vote.deadline} 투표 결과</Header>

      <AnimatedContent open={open}>
        <Content>
          <h4>날짜 인기 순위</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dateChartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                <LabelList dataKey="value" position="top" />
                {dateChartData.map((entry, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <h4 style={{ marginTop: 20 }}>메뉴 인기 순위</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={menuChartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                <LabelList dataKey="value" position="top" />
                {menuChartData.map((entry, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Content>
      </AnimatedContent>
    </Card>
  );
}
