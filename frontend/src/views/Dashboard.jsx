import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import SideBar from '../components/SideBar';

function Dashboard() {
  const [opened, setOpened] = useState(true);

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding={0}
    >
      <SideBar opened={opened} setOpened={setOpened} />
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default Dashboard;
