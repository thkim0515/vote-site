// src/pages/VoteList.jsx

import { useEffect, useState } from "react";
import { Typography, Stack } from "@mui/material";
import PageContainer from "../components/PageContainer";
import VoteCard from "../components/VoteCard";

export default function VoteList() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then((data) => setVotes(data))
      .catch(() => setVotes([]));
  }, []);

  return (
    <PageContainer>
      <Typography variant="h5" gutterBottom>
        투표 리스트
      </Typography>

      <Stack spacing={2}>
        {votes.length === 0 ? (
          <Typography color="textSecondary">등록된 투표가 없습니다.</Typography>
        ) : (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} />)
        )}
      </Stack>
    </PageContainer>
  );
}
