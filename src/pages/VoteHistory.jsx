// src/pages/VoteHistory.js

import { useEffect, useState } from "react";
import { Typography, Stack } from "@mui/material";
import PageContainer from "../components/PageContainer";
import VoteCard from "../components/VoteCard";

export default function VoteHistory() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then((data) => {
        // results 안에 값이 있는 투표만 필터링
        const filtered = data.filter((vote) => Object.keys(vote.results || {}).length > 0);
        setVotes(filtered);
      })
      .catch(() => setVotes([]));
  }, []);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom align="center">
        이전 투표 보기
      </Typography>

      <Stack spacing={2} mt={3}>
        {votes.length === 0 ? (
          <Typography color="textSecondary">
            완료된 투표가 없습니다.
          </Typography>
        ) : (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} isHistory />)
        )}
      </Stack>
    </PageContainer>
  );
}
