'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollFaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/student/enroll-face');
  }, [router]);

  return null;
}
