import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Edit3, Trash2, X, Star, Grid, List, Heart, TrendingUp, Minus, ZoomIn, Copy } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const RepeatBible = () => {
  const [quotes, setQuotes] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('bible');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  
  // 글자 크기 상태 (localStorage에서 불러오기)
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem('repeable-font-size');
    return savedFontSize ? parseInt(savedFontSize) : 18;
  });
  
  const [newQuote, setNewQuote] = useState({
    text: '',
    book: '',
    category: '성공',
    important: false
  });

  const [newEntry, setNewEntry] = useState({
    type: 'gratitude',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['성공', '동기부여', '인간관계', '성장', '지혜', '기타'];

  // 글자 크기 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('repeable-font-size', fontSize.toString());
  }, [fontSize]);

  // 글자 크기 조절 함수
  const increaseFontSize = () => {
    if (fontSize < 32) {
      setFontSize(prev => prev + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(prev => prev - 2);
    }
  };

  // 복사하기 함수
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('복사되었습니다!');
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  };

  // 배열 섞기 함수
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Firebase에서 데이터 실시간 로드
  useEffect(() => {
    const unsubscribeQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuotes(quotesData);
    });

    const unsubscribeDiary = onSnapshot(collection(db, 'diaryEntries'), (snapshot) => {
      const diaryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDiaryEntries(diaryData);
    });

    return () => {
      unsubscribeQuotes();
      unsubscribeDiary();
    };
  }, []);

  const handleAddQuote = async () => {
    if (newQuote.text.trim()) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'quotes'), {
          ...newQuote,
          createdAt: new Date()
        });
        resetQuoteForm();
      } catch (error) {
        console.error('문구 추가 실패:', error);
        alert('문구 추가에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleEditQuote = (id) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      setNewQuote({
        text: quote.text,
        book: quote.book,
        category: quote.category,
        important: quote.important
      });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateQuote = async () => {
    if (editingId && newQuote.text.trim()) {
      setLoading(true);
      try {
        await updateDoc(doc(db, 'quotes', editingId), {
          ...newQuote,
          updatedAt: new Date()
        });
        resetQuoteForm();
      } catch (error) {
        console.error('문구 수정 실패:', error);
        alert('문구 수정에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id) => {
    if (window.confirm('이 문구를 삭제하시겠습니까?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'quotes', id));
      } catch (error) {
        console.error('문구 삭제 실패:', error);
        alert('문구 삭제에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const toggleImportant = async (id) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      try {
        await updateDoc(doc(db, 'quotes', id), {
          important: !quote.important,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('중요도 변경 실패:', error);
      }
    }
  };

  const handleAddDiary = async () => {
    if (newEntry.content.trim()) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'diaryEntries'), {
          ...newEntry,
          createdAt: new Date()
        });
        setNewEntry({
          type: 'gratitude',
          content: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('일기 추가 실패:', error);
        alert('일기 추가에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleEditDiary = (id) => {
    const entry = diaryEntries.find(e => e.id === id);
    if (entry) {
      setNewEntry({
        type: entry.type,
        content: entry.content,
        date: entry.date
      });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateDiary = async () => {
    if (editingId && newEntry.content.trim()) {
      setLoading(true);
      try {
        await updateDoc(doc(db, 'diaryEntries', editingId), {
          ...newEntry,
          updatedAt: new Date()
        });
        setNewEntry({
          type: 'gratitude',
          content: '',
          date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setShowAddForm(false);
      } catch (error) {
        console.error('일기 수정 실패:', error);
        alert('일기 수정에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleDeleteDiary = async (id) => {
    if (window.confirm('이 일기를 삭제하시겠습니까?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'diaryEntries', id));
      } catch (error) {
        console.error('일기 삭제 실패:', error);
        alert('일기 삭제에 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const resetQuoteForm = () => {
    setNewQuote({
      text: '',
      book: '',
      category: '성공',
      important: false
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const resetForm = () => {
    if (activeTab === 'bible') {
      resetQuoteForm();
    } else {
      setNewEntry({
        type: 'gratitude',
        content: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      setShowAddForm(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.book.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
      (filterCategory === 'important' && quote.important) ||
      quote.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // 바이블 정렬: 중요 문구 우선, 각 그룹 내에서 랜덤
  const sortedQuotes = (() => {
    const importantQuotes = shuffleArray(filteredQuotes.filter(quote => quote.important));
    const normalQuotes = shuffleArray(filteredQuotes.filter(quote => !quote.important));
    return [...importantQuotes, ...normalQuotes];
  })();

  const filteredEntries = activeTab === 'bible' ? sortedQuotes : 
    diaryEntries.filter(entry => {
      const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeTab === 'gratitude' ? entry.type === 'gratitude' : 
                         activeTab === 'growth' ? entry.type === 'growth' : true;
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      // 일기는 최신순 정렬 (여러 기준으로 시도)
      let dateA, dateB;
      
      // createdAt이 있으면 사용, 없으면 date 사용
      if (a.createdAt && b.createdAt) {
        dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      } else {
        dateA = new Date(a.date || a.createdAt);
        dateB = new Date(b.date || b.createdAt);
      }
      
      return dateB - dateA; // 최신순 (큰 날짜가 위로)
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          저장 중...
        </div>
      )}
      
      <div className="bg-white shadow-lg border-b-2 border-blue-500">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <BookOpen className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">리피이블</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 12}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
                  title="글자 크기 줄이기"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm text-gray-600 min-w-[2rem] text-center">{fontSize}px</span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize >= 32}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
                  title="글자 크기 키우기"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
              >
                <Plus size={18} />
                <span>
                  {activeTab === 'bible' ? '문구 추가' : 
                   activeTab === 'gratitude' ? '감사 기록' : '성장 기록'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('bible')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'bible' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen size={18} />
              <span>바이블</span>
            </button>
            <button
              onClick={() => setActiveTab('gratitude')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'gratitude' 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Heart size={18} />
              <span>감사일기</span>
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'growth' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp size={18} />
              <span>성장일기</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="검색하세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {activeTab === 'bible' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="important">중요 문구</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? '편집' : '추가'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {activeTab === 'bible' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">문구</label>
                  <textarea
                    value={newQuote.text}
                    onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                    placeholder="문구를 입력하세요... (엔터로 문단을 나눌 수 있습니다)"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 h-32"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">출처</label>
                    <input
                      type="text"
                      value={newQuote.book}
                      onChange={(e) => setNewQuote({...newQuote, book: e.target.value})}
                      placeholder="책 제목"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      value={newQuote.category}
                      onChange={(e) => setNewQuote({...newQuote, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="important"
                    checked={newQuote.important}
                    onChange={(e) => setNewQuote({...newQuote, important: e.target.checked})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="important" className="text-sm text-gray-700">중요 문구</label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={editingId ? handleUpdateQuote : handleAddQuote}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {loading ? '저장 중...' : (editingId ? '수정' : '저장')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="gratitude"
                        checked={newEntry.type === 'gratitude'}
                        onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                        className="mr-2"
                      />
                      감사일기
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="growth"
                        checked={newEntry.type === 'growth'}
                        onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                        className="mr-2"
                      />
                      성장일기
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    placeholder={newEntry.type === 'gratitude' ? 
                      "오늘 감사했던 일들을 상세히 적어보세요... (엔터로 문단을 나눌 수 있습니다)" : 
                      "오늘 성장한 점이나 배운 점을 구체적으로 적어보세요... (엔터로 문단을 나눌 수 있습니다)"}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 h-32"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={editingId ? handleUpdateDiary : handleAddDiary}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {loading ? '저장 중...' : (editingId ? '수정' : '저장')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-xl mb-2">내용이 없습니다</p>
            <p className="text-gray-500">새로운 항목을 추가해보세요!</p>
          </div>
        ) : activeTab === 'bible' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((quote) => (
              <div key={quote.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {quote.category}
                    </span>
                    {quote.important && <Star className="text-yellow-500 fill-current" size={16} />}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(quote.text)}
                      className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                      title="복사하기"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => toggleImportant(quote.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-yellow-500 rounded-lg disabled:opacity-50"
                    >
                      <Star size={16} />
                    </button>
                    <button
                      onClick={() => handleEditQuote(quote.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-lg disabled:opacity-50"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div 
                  className="text-gray-800 font-medium mb-3" 
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    color: 'white', 
                    backgroundColor: '#2d574b', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  "{quote.text}"
                </div>
                {quote.book && (
                  <p className="text-gray-600 text-sm">📖 {quote.book}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border-l-4 ${
                  entry.type === 'gratitude' ? 'border-pink-400' : 'border-green-400'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {entry.type === 'gratitude' ? (
                      <Heart className="text-pink-500" size={16} />
                    ) : (
                      <TrendingUp className="text-green-500" size={16} />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.type === 'gratitude' ? 'bg-pink-100 text-pink-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.type === 'gratitude' ? '감사일기' : '성장일기'}
                    </span>
                    <span className="text-gray-500 text-sm">{entry.date}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(entry.content)}
                      className="p-2 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                      title="복사하기"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleEditDiary(entry.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-lg disabled:opacity-50"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDiary(entry.id)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div 
                  className="whitespace-pre-wrap" 
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    color: 'white', 
                    backgroundColor: '#2d574b', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    lineHeight: '1.6'
                  }}
                >
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepeatBible;