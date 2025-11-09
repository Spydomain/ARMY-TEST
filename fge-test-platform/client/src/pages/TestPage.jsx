import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api.js';
import QuestionCard from '../components/QuestionCard.jsx';
import Layout from '../components/Layout.jsx';

export default function TestPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [mode, setMode] = useState(null);
  const [inputValues, setInputValues] = useState({});

  // React to immediate language changes dispatched from Layout
  useEffect(() => {
    const handler = (e) => setLang(e.detail || localStorage.getItem('lang') || 'en');
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  // Cross-tab single active test lock
  const tabIdRef = useRef(`t-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const heartbeatRef = useRef(null);
  // Stable per-tab session id (persists across route changes/reloads in the same tab)
  const sessionIdRef = useRef(null);
  if (!sessionIdRef.current) {
    let sid = null;
    try { sid = sessionStorage.getItem('test:sessionId'); } catch (_) {}
    if (!sid) {
      sid = `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try { sessionStorage.setItem('test:sessionId', sid); } catch (_) {}
    }
    sessionIdRef.current = sid;
  }

  useEffect(() => {
    const LOCK_KEY = 'test:lock';
    const HEARTBEATS_KEY = 'tabs:heartbeats';
    const isLockActive = (lock) => lock && typeof lock === 'object' && (Date.now() - (lock.ts || 0)) < 4000;
    const getTabCount = () => {
      try {
        const raw = localStorage.getItem(HEARTBEATS_KEY);
        const map = raw ? JSON.parse(raw) : {};
        const now = Date.now();
        let n = 0;
        for (const k of Object.keys(map)) {
          if (map[k] && (now - map[k]) < 4000) n += 1;
        }
        return n;
      } catch (_) { return 1; }
    };

    

    const readLock = () => {
      try { return JSON.parse(localStorage.getItem(LOCK_KEY)); } catch (_) { return null; }
    };
    const writeLock = () => {
      try {
        localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId: tabIdRef.current, sessionId: sessionIdRef.current, category, ts: Date.now() }));
      } catch (_) {}
    };
    const clearLockIfOwned = () => {
      try {
        const cur = readLock();
        if (cur && (cur.tabId === tabIdRef.current || cur.sessionId === sessionIdRef.current)) localStorage.removeItem(LOCK_KEY);
      } catch (_) {}
    };

    // Stabilize detection to avoid race with Layout heartbeat
    let cancelled = false;
    const tryStart = () => {
      if (cancelled) return;
      // Block starting if more than one tab is active
      if (getTabCount() > 1) {
        navigate('/', { replace: true, state: { reason: 'multi_tab_count' } });
        return;
      }
      // Detect existing active lock from another tab before starting
      const existing = readLock();
      if (isLockActive(existing) && existing.sessionId && existing.sessionId !== sessionIdRef.current) {
        navigate('/', { replace: true, state: { reason: 'multi_tab_active' } });
        return;
      }
      // Acquire lock now
      writeLock();
      startHeartbeat();
    };

    // Immediate check and a delayed re-check after heartbeat likely initialized
    tryStart();
    const startTimer = setTimeout(tryStart, 700);

    function startHeartbeat() {
      stopHeartbeat();
      heartbeatRef.current = setInterval(() => {
        const cur = readLock();
        if (!cur || cur.sessionId === sessionIdRef.current) {
          writeLock();
        }
      }, 1000);
    }

    function stopHeartbeat() {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    // End test immediately if another tab starts mid-test, or if total tab count exceeds 1
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return;
      try {
        if (e.key === LOCK_KEY) {
          const newVal = e.newValue ? JSON.parse(e.newValue) : null;
          if (newVal && isLockActive(newVal) && newVal.sessionId && newVal.sessionId !== sessionIdRef.current) {
            forceSubmit('multi_tab');
            return;
          }
        }
        if (e.key === HEARTBEATS_KEY) {
          if (getTabCount() > 1) {
            forceSubmit('multi_tab_count');
            return;
          }
        }
      } catch (_) {}
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      stopHeartbeat();
      clearLockIfOwned();
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [category, navigate]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    // Try restore from localStorage first
    try {
      const raw = localStorage.getItem(`test:${category}`);
      if (raw) {
        const snapshot = JSON.parse(raw);
        if (snapshot && Array.isArray(snapshot.questions)) {
          // Ensure uniqueness of questions by id when restoring
          const seen = new Set();
          const uniq = snapshot.questions.filter((q) => {
            if (!q || !q.id) return false;
            if (seen.has(q.id)) return false;
            seen.add(q.id);
            return true;
          });
          // Only restore if we have valid questions with images
          if (uniq.length > 0 && uniq.every(q => q.imageUrl)) {
            setQuestions(uniq);
            setIndex(Number(snapshot.index) || 0);
            setAnswers(snapshot.answers || {});
            if (snapshot.mode === 'mcq' || snapshot.mode === 'input') setMode(snapshot.mode);
            setLoading(false);
            mounted = false; // Skip fetch below
          }
        }
      }
    } catch (_) {
      // ignore parse errors, proceed to fetch
    }

    // no-op: history is shown on Home page only

    if (mounted) {
      api
      .get(`/questions/random/${category}`, { params: { limit: 10 } })
        .then((res) => {
        if (!mounted) return;

        // Log the full response for debugging
        console.log('Full API response:', res);

        // Handle API response
        let questions = [];
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          questions = res.data.data;
        } else if (Array.isArray(res.data)) {
          questions = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          questions = res.data.data;
        } else if (res.data && res.data.data && Array.isArray(res.data.data.data)) {
          questions = res.data.data.data;
        } else if (res.data && res.data.data) {
          // Handle case where data is a single question object
          questions = [res.data.data];
        } else if (res.data) {
          // Handle case where response is a single question
          questions = [res.data];
        }

        // Ensure we have an array of questions
        if (!Array.isArray(questions)) {
          console.error('Invalid questions data format:', questions);
          questions = [];
        }

        // Filter out questions without images
        const questionsWithImages = questions.filter((q) => q && q.imageUrl);

        // Deduplicate by id
        const seen = new Set();
        const uniq = questionsWithImages.filter((q) => {
          if (!q || !q.id) return false;
          if (seen.has(q.id)) return false;
          seen.add(q.id);
          return true;
        });

        console.log('Processed questions:', uniq);
        console.log('Questions without images filtered out:', questions.length - questionsWithImages.length);

        if (uniq.length === 0) {
          console.error('No valid questions with images found after processing');
          setError('No questions with images available for this category');
        } else {
          console.log('Setting questions:', uniq.length);
          setQuestions(uniq);
          setIndex(0);
          setAnswers({});
          setError('');
        }
        })
        .catch((error) => {
          if (!mounted) return;
          console.error('Error loading questions:', error);
          if (error.response && error.response.status === 404) {
            setError(`No questions available for category: ${category}`);
          } else {
            setError('Failed to load questions');
          }
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [category]);

  // Persist progress whenever it changes
  useEffect(() => {
    if (!category) return;
    if (!questions || questions.length === 0) return;
    try {
      const payload = {
        questions,
        index,
        answers,
        mode,
        ts: Date.now(),
      };
      localStorage.setItem(`test:${category}`, JSON.stringify(payload));
    } catch (_) {
      // ignore storage errors
    }
  }, [category, questions, index, answers, mode]);

  const current = questions[index];
  const total = questions.length;
  const totalAnswered = Object.keys(answers).length;

  // Debug: Log questions and current question
  useEffect(() => {
    console.log('Questions:', questions);
    console.log('Current question:', current);
    console.log('Answers:', answers);
  }, [questions, current, answers]);

  const handleSelect = (key) => {
    if (!current) return;
    setAnswers((prev) => (prev[current.id] ? prev : { ...prev, [current.id]: key }));
  };

  const handleInputChange = (val) => {
    if (!current) return;
    if (answers[current.id]) return;
    setInputValues((prev) => ({ ...prev, [current.id]: val }));
  };

  const handleInputCheck = () => {
    if (!current) return;
    if (answers[current.id]) return;
    const raw = (inputValues[current.id] || '').toString().trim();
    if (!raw) return;
    setAnswers((prev) => ({ ...prev, [current.id]: raw }));
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  const isCorrect = (q, sel) => {
    if (!q || !sel) return false;
    // Accept either the key (A/B/C/D) or the option text for input mode
    const key = sel.toString().trim();
    if (key.toUpperCase() === (q.correctAnswer || '').toUpperCase()) return true;
    const correctKey = (q.correctAnswer || '').toUpperCase();
    const correctText = (q[`option${correctKey}`] || '').toString().trim();
    return key.localeCompare(correctText, undefined, { sensitivity: 'accent' }) === 0;
  };

  // Force submit without confirmation (used when another tab opens mid-test)
  const forceSubmit = () => {
    // Compute correct answers
    let correct = 0;
    for (const q of questions) {
      const sel = answers[q.id];
      if (sel && isCorrect(q, sel)) correct += 1;
    }
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Save history entry
    try {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ts: Date.now(),
        category,
        mode: mode || 'mcq',
        total,
        answered: Object.keys(answers).length,
        correct,
        percentage,
        reason: 'forced',
      };
      const raw = localStorage.getItem(`test:history:${category}`);
      const list = raw ? JSON.parse(raw) : [];
      const updated = [entry, ...(Array.isArray(list) ? list : [])].slice(0, 50);
      localStorage.setItem(`test:history:${category}`, JSON.stringify(updated));
    } catch (_) {}

    try { localStorage.removeItem(`test:${category}`); } catch (_) {}
    try {
      const cur = JSON.parse(localStorage.getItem('test:lock'));
      if (cur && (cur.tabId === (tabIdRef.current) || cur.sessionId === sessionIdRef.current)) localStorage.removeItem('test:lock');
    } catch (_) {}

    navigate('/results', {
      state: { category, total, answered: Object.keys(answers).length, correct, percentage, reason: 'multi_tab' },
      replace: true,
    });
  };

  const submit = () => {
    if (totalAnswered < total) {
      const proceed = window.confirm(`You answered ${totalAnswered}/${total}. Do you want to end the test and submit?`);
      if (!proceed) return;
    }
    // Compute correct answers
    let correct = 0;
    for (const q of questions) {
      const sel = answers[q.id];
      if (sel && isCorrect(q, sel)) correct += 1;
    }
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Save history entry
    try {
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ts: Date.now(),
        category,
        mode: mode || 'mcq',
        total,
        answered: totalAnswered,
        correct,
        percentage,
      };
      const raw = localStorage.getItem(`test:history:${category}`);
      const list = raw ? JSON.parse(raw) : [];
      const updated = [entry, ...(Array.isArray(list) ? list : [])].slice(0, 50);
      localStorage.setItem(`test:history:${category}`, JSON.stringify(updated));
    } catch (_) {}

    navigate('/results', {
      state: {
        category,
        total,
        answered: totalAnswered,
        correct,
        percentage,
      },
      replace: false,
    });

    // Clear saved progress for this category
    try { localStorage.removeItem(`test:${category}`); } catch (_) {}
    // Release lock
    try {
      const cur = JSON.parse(localStorage.getItem('test:lock'));
      if (cur && (cur.tabId === (tabIdRef.current) || cur.sessionId === sessionIdRef.current)) {
        localStorage.removeItem('test:lock');
      }
    } catch (_) {}
  };

  useEffect(() => {
    const onEndRequest = () => {
      if (!mode) return;
      const proceed = window.confirm('Do you want to end the test and submit?');
      if (proceed) submit();
    };
    window.addEventListener('test:end_request', onEndRequest);
    return () => window.removeEventListener('test:end_request', onEndRequest);
  }, [mode, totalAnswered, questions, answers]);

  useEffect(() => {
    const handler = (e) => {
      if (!mode) return;
      if (questions.length > 0 && Object.keys(answers).length <= questions.length) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [mode, questions, answers]);

  useEffect(() => {
    if (!mode) return;
    const onBack = () => {
      const proceed = window.confirm('Do you want to end the test and submit?');
      if (proceed) {
        submit();
      } else {
        history.pushState(null, '', window.location.href);
      }
    };
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, [mode, totalAnswered, questions, answers]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg">Loading questions...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Questions</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  if (!current) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
          <p className="mb-4">There are no questions available for this category.</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 animate-in">
        {mode && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">{category}</div>
              <div className="text-sm">Q: {index + 1}/{total} · Answered: {totalAnswered}/{total}</div>
            </div>
            <div className="h-2 w-full rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${Math.round((totalAnswered / Math.max(total,1)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {!mode ? (
          <div className="border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Choose Answer Mode</h3>
            <p className="text-sm text-muted-foreground mb-4">Select how you want to answer before starting the test.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setMode('mcq'); }}
                className="px-4 py-2 rounded-md border hover:bg-muted"
              >
                Multiple Choice (MCQ)
              </button>
              <button
                type="button"
                onClick={() => { setMode('input'); }}
                className="px-4 py-2 rounded-md border hover:bg-muted"
              >
                Input (Type Answer)
              </button>
            </div>
          </div>
        ) : null}

        {mode && (
          <QuestionCard
            question={current}
            lang={lang}
            selected={answers[current.id]}
            onSelect={handleSelect}
            mode={mode}
            inputValue={inputValues[current.id] || ''}
            onInputChange={handleInputChange}
            onInputCheck={handleInputCheck}
          />
        )}

        {mode && (
        <div className="flex items-center justify-between mt-6 gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={!mode || index === 0}
            className="px-4 py-2 rounded-md border disabled:opacity-50 hover:bg-muted"
          >
            Previous
          </button>
          <div className="text-sm text-muted-foreground">Answered: {totalAnswered}</div>
          <div className="flex items-center gap-2">
            {index < total - 1 && (
              <button
                type="button"
                onClick={next}
                disabled={!mode}
                className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-50"
              >
                Next
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!mode}
              className="px-4 py-2 rounded-md border hover:bg-muted disabled:opacity-50"
              >
              End Test
            </button>
            {index === total - 1 && (
              <button
                type="button"
                onClick={submit}
                disabled={!mode}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Submit
              </button>
            )}
          </div>
        </div>
        )}

        {/* history removed from Test page */}
      </div>
    </Layout>
  );
}
