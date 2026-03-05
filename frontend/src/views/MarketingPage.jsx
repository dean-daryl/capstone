import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  ThemeIcon,
  List,
  Stack,
  Box,
  Image,
  Center,
} from '@mantine/core';
import {
  IconBrain,
  IconCamera,
  IconVideo,
  IconFileText,
  IconBrandChrome,
  IconSparkles,
  IconCheck,
  IconRobot,
} from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/AuthModals';

function MarketingPage() {
  const { isLoginOpen, isRegisterOpen, openLogin, openRegister, closeModals } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-indigo-0) 0%, var(--mantine-color-violet-0) 100%)',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        }}
      >
        <Container size="lg" py={80}>
          <Stack align="center" gap="lg">
            <Group gap="sm">
              <IconRobot size={40} color="var(--mantine-color-indigo-6)" />
              <Title order={1}>SomaTek AI</Title>
            </Group>
            <Title
              order={1}
              ta="center"
              size={48}
              style={{
                background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-violet-5))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Transform Any Content Into Text
            </Title>
            <Text size="xl" c="dimmed" ta="center" maw={600}>
              Instantly transcribe images, videos, and text with our powerful AI-powered Chrome extension.
            </Text>
            <Group>
              <Button size="lg" leftSection={<IconBrandChrome size={20} />}>
                Add to Chrome
              </Button>
              <Button size="lg" variant="default" onClick={openLogin}>
                Get Started
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg="var(--mantine-color-gray-0)" py={80}>
        <Container size="lg">
          <Title order={2} ta="center" mb="xl">
            Powerful Features
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <FeatureCard
              icon={<IconCamera size={24} />}
              title="Image Recognition"
              description="Extract text from images, screenshots, and photos with high accuracy"
            />
            <FeatureCard
              icon={<IconVideo size={24} />}
              title="Video Transcription"
              description="Convert video content into text in real-time with multiple language support"
            />
            <FeatureCard
              icon={<IconFileText size={24} />}
              title="Text Processing"
              description="Process and organize text content with AI-powered formatting"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container size="lg" py={80}>
        <Title order={2} ta="center" mb="xl">
          Why Choose SomaTek AI?
        </Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card shadow="sm" padding="lg" withBorder>
            <Card.Section>
              <Image
                src="https://images.unsplash.com/photo-1712245833905-5057a4245271?q=80&w=3139&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                h={200}
                alt="AI Technology"
              />
            </Card.Section>
            <Title order={3} mt="md" mb="sm">
              Advanced AI Technology
            </Title>
            <List
              spacing="xs"
              icon={<IconCheck size={16} color="var(--mantine-color-green-6)" />}
            >
              <List.Item>State-of-the-art machine learning models</List.Item>
              <List.Item>99% accuracy in transcription</List.Item>
              <List.Item>Real-time processing capabilities</List.Item>
              <List.Item>Multi-language support</List.Item>
            </List>
          </Card>
          <Card shadow="sm" padding="lg" withBorder>
            <Card.Section>
              <Image
                src="https://images.unsplash.com/photo-1648301033733-44554c74ec50?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                h={200}
                alt="Productivity"
              />
            </Card.Section>
            <Title order={3} mt="md" mb="sm">
              Boost Your Productivity
            </Title>
            <List
              spacing="xs"
              icon={<IconCheck size={16} color="var(--mantine-color-green-6)" />}
            >
              <List.Item>Save hours on manual transcription</List.Item>
              <List.Item>Easy-to-use browser extension</List.Item>
              <List.Item>Instant results with one click</List.Item>
              <List.Item>Seamless workflow integration</List.Item>
            </List>
          </Card>
        </SimpleGrid>
      </Container>

      {/* CTA Section */}
      <Box
        py={80}
        style={{
          background: 'linear-gradient(180deg, var(--mantine-color-gray-0) 0%, var(--mantine-color-body) 100%)',
        }}
      >
        <Container size="sm">
          <Stack align="center" gap="lg">
            <ThemeIcon size={48} radius="xl" variant="light" color="indigo">
              <IconSparkles size={28} />
            </ThemeIcon>
            <Title order={2} ta="center">
              Ready to Transform Your Workflow?
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Join thousands of users who are already saving time with SomaTek AI
            </Text>
            <Button
              size="lg"
              leftSection={<IconBrandChrome size={20} />}
              onClick={openRegister}
            >
              Get Started Now
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py="lg" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Text ta="center" c="dimmed" size="sm">
          &copy; 2024 SomaTek AI. All rights reserved.
        </Text>
      </Box>

      <AuthModal
        isOpen={isLoginOpen}
        onClose={closeModals}
        onModalSwitch={() => { closeModals(); openRegister(); }}
        type="login"
      />
      <AuthModal
        isOpen={isRegisterOpen}
        onClose={closeModals}
        onModalSwitch={() => { closeModals(); openLogin(); }}
        type="register"
      />
    </Box>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <ThemeIcon size={48} radius="md" variant="light" color="indigo" mb="md">
        {icon}
      </ThemeIcon>
      <Title order={4} mb="xs">
        {title}
      </Title>
      <Text c="dimmed">{description}</Text>
    </Card>
  );
}

export default MarketingPage;
