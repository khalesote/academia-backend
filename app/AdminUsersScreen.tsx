import React from 'react';
import { useRouter } from 'expo-router';

export default function AdminUsersScreen() {
  const router = useRouter();

  return router.replace('/FirebaseUsersScreen');
}
