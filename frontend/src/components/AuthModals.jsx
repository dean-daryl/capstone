import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Divider,
  Group,
  Text,
  Select,
  Title,
} from '@mantine/core';
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { login as loginApi, signup } from '../api/authService';
import { useAuth } from '../context/AuthContext';

const loginDataInitial = { username: '', password: '' };
const signupDataInitial = { firstName: '', lastName: '', email: '', password: '', role: '' };

export function AuthModal({ isOpen, onClose, onModalSwitch, type }) {
  const [loginData, setLoginData] = useState(loginDataInitial);
  const [signupData, setSignupData] = useState(signupDataInitial);
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'login') {
        const response = await loginApi(loginData);
        if (response?.status == true) {
          notifications.show({ title: 'Welcome back!', message: 'Login successful', color: 'green' });
          authLogin({
            token: response.data.token,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            role: response.data.role,
            userId: response.data.userId,
          });
          onClose();
          navigate('/dashboard/query');
        } else {
          notifications.show({ title: 'Error', message: response.message, color: 'red' });
        }
      } else {
        const response = await signup(signupData);
        if (response?.status == true) {
          notifications.show({ title: 'Account created', message: 'Signup successful', color: 'green' });
          onModalSwitch();
        } else {
          notifications.show({ title: 'Error', message: response.message, color: 'red' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Title order={3}>{type === 'login' ? 'Welcome Back' : 'Create Account'}</Title>
      }
      centered
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          {type === 'register' && (
            <>
              <TextInput
                label="First Name"
                placeholder="First Name"
                value={signupData.firstName}
                onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
              />
              <TextInput
                label="Last Name"
                placeholder="Last Name"
                value={signupData.lastName}
                onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
              />
              <Select
                label="Role"
                placeholder="Select Role"
                data={[
                  { value: 'STUDENT', label: 'Student' },
                  { value: 'TEACHER', label: 'Teacher' },
                ]}
                value={signupData.role}
                onChange={(val) => setSignupData({ ...signupData, role: val })}
              />
            </>
          )}
          <TextInput
            label="Email"
            type="email"
            placeholder="Email"
            value={type === 'login' ? loginData.username : signupData.email}
            onChange={(e) => {
              if (type === 'login') {
                setLoginData({ ...loginData, username: e.target.value });
              } else {
                setSignupData({ ...signupData, email: e.target.value });
              }
            }}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            value={type === 'login' ? loginData.password : signupData.password}
            onChange={(e) => {
              if (type === 'login') {
                setLoginData({ ...loginData, password: e.target.value });
              } else {
                setSignupData({ ...signupData, password: e.target.value });
              }
            }}
          />
          <Button type="submit" fullWidth loading={loading}>
            {type === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Stack>
      </form>

      <Divider label="Or continue with" labelPosition="center" my="md" />

      <Group grow>
        <Button variant="default" leftSection={<IconBrandGoogle size={18} />}>
          Google
        </Button>
        <Button variant="default" leftSection={<IconBrandGithub size={18} />}>
          GitHub
        </Button>
      </Group>

      <Text ta="center" size="sm" mt="md" c="dimmed">
        {type === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Text component="button" type="button" onClick={onModalSwitch} c="indigo" fw={500} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign up
            </Text>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Text component="button" type="button" onClick={onModalSwitch} c="indigo" fw={500} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign in
            </Text>
          </>
        )}
      </Text>
    </Modal>
  );
}
