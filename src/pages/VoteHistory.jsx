// src/pages/VoteHistory.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Stack } from "@mui/material";
import styled from "styled-components";
import PageContainer from "../components/PageContainer";
import VoteHistoryCard from "../components/VoteHistoryCard";

import { getVotes } from "../api/api";

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

export default function VoteHistory() {
  const [votes, setVotes] = useState([]);
  const navigate = useNavigate();
  const goHome = () => navigate("/");

  useEffect(() => {
    async function loadVotes() {
      try {
        const data = await getVotes();

        // results가 있는 투표만 노출
        const filtered = data.filter(
          (vote) => vote.results && Object.keys(vote.results).length > 0
        );

        setVotes(filtered);
      } catch {
        setVotes([]);
      }
    }

    loadVotes();
  }, []);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom align="center">
        이전 투표 보기
      </Typography>

      <Stack spacing={2} mt={3}>
        {votes.length === 0 ? (
          <Typography color="textSecondary">완료된 투표가 없습니다.</Typography>
        ) : (
          votes.map((vote) => <VoteHistoryCard key={vote.id} vote={vote} />)
        )}
      </Stack>

      <HomeButton onClick={goHome}>홈으로</HomeButton>
    </PageContainer>
  );
}
