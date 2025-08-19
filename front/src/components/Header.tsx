"use client";
import React from 'react';
import { Button } from './ui/button';
import { signOut } from 'next-auth/react';

const Header = () => {
  const handleLogout = () => {
    // サインアウト後にトップページにリダイレクト
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="flex justify-between items-center h-12 bg-orange-100 px-4">
      <h1 className="text-2xl text-orange-700">TokoToko</h1>
      <Button
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl"
        onClick={handleLogout}
      >
        ログアウト
      </Button>
    </div>
  );
};

export default Header;

