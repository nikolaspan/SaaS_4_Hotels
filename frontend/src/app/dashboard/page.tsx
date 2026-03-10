'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { UserRole } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/rooms">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rooms</dt>
                      <dd className="text-lg font-medium text-gray-900">Manage Rooms</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/guests">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Guests</dt>
                      <dd className="text-lg font-medium text-gray-900">Manage Guests</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/bookings">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Bookings</dt>
                      <dd className="text-lg font-medium text-gray-900">Manage Bookings</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {user?.role === UserRole.ADMIN && (
            <Link href="/users">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                        <dd className="text-lg font-medium text-gray-900">Manage Users</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
