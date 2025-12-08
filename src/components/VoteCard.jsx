import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function VoteCard({ vote }) {
  return (
    <Card
      component={Link}
      to={`/vote/detail/${vote.id}`}
      style={{ textDecoration: "none" }}
    >
      <CardContent>
        <Typography variant="h6">{vote.selectedMenu}</Typography>
        <Typography variant="body2">마감일: {vote.deadline}</Typography>
      </CardContent>
    </Card>
  );
}
