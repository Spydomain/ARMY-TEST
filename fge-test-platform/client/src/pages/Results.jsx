import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const total = state?.total ?? 0;
  const answered = state?.answered ?? 0;
  const category = state?.category ?? '';
  const correct = state?.correct ?? 0;
  const percentage = state?.percentage ?? (total > 0 ? Math.round((correct / total) * 100) : 0);
  const grade = percentage >= 70 ? 'Good' : 'Bad';
  const cheers = percentage >= 90
    ? 'Excellent job! 🎉'
    : percentage >= 70
      ? 'Well done! ✅'
      : percentage >= 50
        ? 'Good effort! 👍'
        : 'Keep practicing! 💪';
  const reason = state?.reason;

  return (
    <Layout>
      <div className="relative max-w-xl mx-auto p-6 text-center animate-in">
        {reason === 'multi_tab' && (
          <div className="mb-4 px-3 py-2 text-sm rounded-md border bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-800 dark:text-amber-200">
            The test was ended because another browser tab opened a test.
          </div>
        )}
        {grade === 'Good' && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece absolute top-0 left-1/2 text-xs"
                style={{
                  left: `${(i * 97) % 100}%`,
                  animationDuration: `${3 + (i % 5) * 0.4}s`,
                  animationDelay: `${(i % 10) * 0.1}s`,
                }}
              >
                {i % 3 === 0 ? '🎉' : i % 3 === 1 ? '✨' : '🎊'}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2">Results</h1>
        {category && (
          <div className="text-sm text-muted-foreground mb-4">Category: {category}</div>
        )}

        <div className="text-5xl font-extrabold mb-2">{correct}/{total}</div>
        <div className="text-lg text-muted-foreground mb-8">{percentage}%</div>

        <div className="mb-6">
          <span className={
            `inline-block rounded-full px-3 py-1 text-sm border ` +
            (grade === 'Good'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-600 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-600 text-red-700 dark:text-red-300')
          }>
            {grade}
          </span>
          <div className="mt-3 text-base">
            <span className={grade === 'Good' ? 'inline-block animate-bounce' : ''}>{cheers}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="px-4 py-2 rounded-md border hover:bg-muted"
          >
            Back
          </button>
          {category && (
            <Link
              to={`/test/${category}`}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Retry
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
