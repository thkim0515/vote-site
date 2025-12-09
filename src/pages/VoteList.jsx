// src/pages/VoteList.jsx

import { useEffect, useState } from "react";
import { Typography, Stack } from "@mui/material";
import PageContainer from "../components/PageContainer";
import VoteCard from "../components/VoteCard";

import { getVotes } from "../api/api";

export default function VoteList() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    async function loadVotes() {
      try {
        const data = await getVotes();
        setVotes(data);
      } catch {
        setVotes([]);
      }
    }

    loadVotes();
  }, []);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom align="center">
        투표 리스트
      </Typography>

      <Stack spacing={2} mt={2}>
        {votes.length === 0 ? (
          <Typography color="textSecondary">
            등록된 투표가 없습니다.
          </Typography>
        ) : (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} />)
        )}
      </Stack>
    </PageContainer>
  );
}
