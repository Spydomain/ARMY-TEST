import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import axios from 'axios';

const CATEGORIES = [
  { id: 'IDENT1', labelEn: 'Armored Personnel Carriers (VBTT)', labelFr: 'Véhicules Blindés de Transport de Troupes (VBTT)' },
  { id: 'IDENT2', labelEn: 'Infantry Fighting Vehicles (VBCI)', labelFr: "Véhicules Blindés de Combat d'Infanterie (VBCI)" },
  { id: 'IDENT3', labelEn: 'Tanks', labelFr: 'Chars' },
  { id: 'IDENT4', labelEn: 'Individual Weapons (AK, RPG, etc.)', labelFr: 'Armes individuelles (AK, RPG, etc.)' },
  { id: 'IDENT5', labelEn: 'Helicopters', labelFr: 'Hélicoptères' },
  { id: 'IDENT6', labelEn: 'Revision Test (Mixed)', labelFr: 'Test de révision (mixte)' },
];

export default function Home() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const location = useLocation();
  const reason = location.state?.reason;
  const [history, setHistory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkCategories = async () => {
      const available = {};
      
      // Initialize all categories as unavailable by default
      CATEGORIES.forEach(category => {
        available[category.id] = false;
      });
      
      // Check all categories
      const categoriesToCheck = CATEGORIES;
      
      setLoading(true);
      
      try {
        // Check each category in sequence with a small delay between requests
        for (const category of categoriesToCheck) {
          try {
            const response = await axios.get(`/api/questions/random/${category.id}?limit=1`, {
              validateStatus: status => status < 500 // Don't throw for 4xx errors
            });
            
            // If we get a successful response with data, the category exists
            available[category.id] = response.status === 200 && response.data && response.data.success && Array.isArray(response.data.data);
            
            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`Error checking category ${category.id}:`, error);
            available[category.id] = false;
          }
        }
      } catch (error) {
        console.error('Error in category check loop:', error);
      } finally {
        setAvailableCategories(available);
        setLoading(false);
      }
    };

    checkCategories();
  }, []);

  useEffect(() => {
    const handler = (e) => setLang(e.detail || localStorage.getItem('lang') || 'en');
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const title = useMemo(() => lang === 'fr' ? 'FGE - Plateforme de test d\'identification' : 'FGE - Identification Test Platform', [lang]);

  useEffect(() => {
    try {
      const all = [];
      for (const c of CATEGORIES) {
        const raw = localStorage.getItem(`test:history:${c.id}`);
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list)) {
          for (const item of list) {
            all.push({ ...item, category: c.id });
          }
        }
      }
      all.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setHistory(all.slice(0, 20));
    } catch (_) {}
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 animate-in">
        {(reason === 'multi_tab_active' || reason === 'multi_tab_count') && (
          <div className="mb-4 px-3 py-2 text-sm rounded-md border bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-800 dark:text-amber-200">
            Another browser tab is open. Please close other tabs before starting a test.
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <p className="text-muted-foreground mb-6">
          {lang === 'fr'
            ? 'Choisissez une catégorie pour commencer un test de 10 questions.'
            : 'Choose a category to begin a 10-question test.'}
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {lang === 'fr' ? 'Chargement des catégories...' : 'Loading categories...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`p-6 rounded-lg border transition-colors ${
                  availableCategories[category.id] 
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-70'
                }`}
                onClick={() => {
                  if (availableCategories[category.id]) {
                    window.location.href = `/test/${category.id}`;
                  }
                }}
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {lang === 'fr' ? category.labelFr : category.labelEn}
                </h3>
                {availableCategories[category.id] ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {lang === 'fr' ? 'Cliquez pour commencer' : 'Click to start'}
                  </p>
                ) : (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {lang === 'fr' ? 'Aucune question disponible pour le moment' : 'No questions available at the moment'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recent Test History</h3>
            <button
              type="button"
              onClick={() => {
                const ok = window.confirm(lang === 'fr' ? 'Effacer tout l\'historique des tests ?' : 'Clear all test history?');
                if (!ok) return;
                try {
                  for (const c of CATEGORIES) {
                    localStorage.removeItem(`test:history:${c.id}`);
                  }
                } catch (_) {}
                setHistory([]);
              }}
              className="px-3 py-1 rounded-md border text-sm hover:bg-muted"
            >
              {lang === 'fr' ? 'Effacer l\'historique' : 'Clear History'}
            </button>
          </div>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={`${h.category}-${h.id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{new Date(h.ts).toLocaleString()}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{h.category}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Mode: {h.mode}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{h.correct}/{h.total}</span>
                    <span className="ml-2 text-muted-foreground">({h.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{lang === 'fr' ? 'Aucun historique de test.' : 'No test history yet.'}</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
