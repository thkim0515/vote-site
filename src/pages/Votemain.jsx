import { useEffect, useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import VoteCard from "../components/VoteCard";

export default function Votemain() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/getVotes")
      .then((res) => res.json())
      .then((data) => setVotes(data))
      .catch(() => setVotes([]));
  }, []);

  return (
    <PageContainer>
      <Typography variant="h4" gutterBottom align="center">
        투표 메인
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" component={Link} to="/vote/create">
          투표 만들기
        </Button>
        <Button variant="outlined" component={Link} to="/vote/history">
          이전 투표 보기
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        현재 진행 중인 투표
      </Typography>

      <Stack spacing={2}>
        {votes.length === 0 ? (
          <Typography color="textSecondary">
            현재 진행 중인 투표가 없습니다.
          </Typography>
        ) : (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} />)
        )}
      </Stack>
    </PageContainer>
  );
}
