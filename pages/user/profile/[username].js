import {
  Avatar,
  Card,
  CardContent,
  Container,
  Typography,
  Box,
  Table,
  TableRow,
  Button,
  TableCell,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export async function getServerSideProps(context) {
  return { props: { username: context.params.username } };
}
export default function profile({ username }) {
  const router = useRouter();
  const [result, setResult] = useState(null);
  useEffect(async () => {
    try {
      const resp = await axios.post('/api/getUserStatistics', { username });
      console.log(resp.data);
      setResult(resp.data);
    } catch (err) {
      console.log(err);
      setResult(null);
    }
  }, []);
  return (
    <Container>
      <Card>
        <CardContent>
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar style={{ width: '20%', height: '20%' }} />
            <br />
            <Typography variant="h3">
              {`${result?.firstName ?? 'john'} ${result?.lastName ?? 'doe'}`}
            </Typography>
            <br />
            <br />
            <br />
            <Typography variant="h4" style={{ display: 'flex', alignSelf: 'flex-start' }}>
              Info
            </Typography>
            <Table>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{result?.email ?? 'someone@example.com'}</TableCell>
                <TableCell>
                  <Button variant="contained">Change</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ borderBottom: 'none' }}>Username</TableCell>
                <TableCell style={{ borderBottom: 'none' }}>
                  {result?.username ?? 'johndoe'}
                </TableCell>
                <TableCell style={{ borderBottom: 'none' }}>
                  <Button onClick={() => router.push('/user/updateUsername')} variant="contained">
                    Change
                  </Button>
                </TableCell>
              </TableRow>
            </Table>
            <Box style={{ display: 'flex', justifyItems: 'center', flexDirection: 'column' }}>
              <Button onClick={() => router.push('/user/updatePassword')} variant="contained">
                Change Password
              </Button>
            </Box>
          </Box>

          <br />
          <br />
          <br />
          <Typography variant="h4" style={{ display: 'flex', alignSelf: 'flex-start' }}>
            Statistics
          </Typography>
          <Table>
            <TableRow>
              <TableCell>Last Upload: </TableCell>
              <TableCell>{result?.lastUploadDate ?? '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ borderBottom: 'none' }}>Total HARs Uploaded: </TableCell>
              <TableCell style={{ borderBottom: 'none' }}>{result?.totalUploads ?? '0'}</TableCell>
            </TableRow>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
}
