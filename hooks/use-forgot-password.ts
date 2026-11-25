'use client';

import { useState } from 'react';

export type Step = 'email' | 'otp' | 'new-password' | 'success';

export function useForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (step === 'email') setStep('otp');
      else if (step === 'otp') setStep('new-password');
      else if (step === 'new-password') setStep('success');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const containerVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return {
    step,
    setStep,
    email,
    setEmail,
    otp,
    setOtp,
    showPassword,
    setShowPassword,
    isLoading,
    handleNextStep,
    handleOtpChange,
    containerVariants,
  };
}
