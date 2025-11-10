import React, { useEffect } from 'react';

function QuestionCard({ question, lang = 'en', selected, onSelect, mode = 'mcq', inputValue = '', onInputChange, onInputCheck }) {
  // Debug: Log question props
  useEffect(() => {
    console.log('QuestionCard - Question:', question);
    console.log('QuestionCard - Image URL:', question?.imageUrl);
  }, [question]);
  // Use the question text from the API or fallback to a default
  const qText = question.questionText ? question.questionText.replace(/: .*/, '') : "Identify this military vehicle";
  
  // Get all available options
  const options = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ].filter(opt => opt.text && opt.text.trim() !== ''); // Only include non-empty options

  const correctKey = (question.correctAnswer || '').toString().toUpperCase();
  const correctText = (question[`option${correctKey}`] || '').toString().trim();
  
  // Simple function to check if an answer is correct
  const isCorrect = (val) => {
    if (!val) return false;
    const trimmedVal = val.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const correctNormalized = correctText.toLowerCase().replace(/[^a-z0-9]/g, '');
    return trimmedVal === correctKey.toLowerCase() || trimmedVal === correctNormalized;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* Question Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">{qText}</h2>
        <div className="h-1 w-16 bg-blue-500 mx-auto mb-6"></div>
      </div>

      {/* Image Display */}
      {question.imageUrl && (
        <div className="mb-8 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex flex-col items-center">
          <img
            src={question.imageUrl}
            alt={question.questionText || 'Military Vehicle'}
            className="max-h-80 max-w-full object-contain rounded-md shadow-sm"
            loading="lazy"
            onError={(e) => {
              console.error('Error loading image:', question.imageUrl, e);
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Options Section */}
      <div className="mt-8">
        {mode === 'mcq' ? (
          options.length > 0 ? (
            <div className="space-y-3">
              {options.map((o) => {
                const isSelected = selected === o.key;
                const picked = selected ? selected : null;
                const isCorrectOption = o.key === correctKey;

                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => onSelect?.(o.key)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selected 
                        ? o.key === correctKey 
                          ? 'bg-green-50 border-green-500 dark:bg-green-900/30 text-green-700 dark:text-green-200'
                          : o.key === selected 
                          ? 'bg-red-50 border-red-500 dark:bg-red-900/30 text-red-700 dark:text-red-200'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer'
                    }`}
                    disabled={!!selected}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                        selected
                          ? o.key === correctKey
                            ? 'bg-green-500 border-green-500 text-white'
                            : o.key === selected
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'border-gray-300 dark:border-gray-500'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {o.key}
                      </div>
                      <span className="text-left">{o.text}</span>
                      {picked && isCorrectOption && !isSelected && (
                        <span className="ml-auto text-green-500">
                          ✓ Correct Answer
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No options available for this question.
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                disabled={!!selected}
                className={`w-full px-4 py-3 text-lg rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  selected 
                    ? isCorrect(selected) 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
                placeholder="Type the vehicle name..."
              />
              {selected && (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xl ${
                  isCorrect(selected) ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isCorrect(selected) ? '✓' : '✗'}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => onInputCheck?.()}
                disabled={!!selected || !inputValue.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selected 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {selected ? 'Answered' : 'Check Answer'}
              </button>
              
              {selected && !isCorrect(selected) && (
                <div className="text-red-500 dark:text-red-400">
                  Correct answer: <span className="font-semibold">{correctText}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Feedback Section */}
        {selected && (
          <div className={`mt-6 p-4 rounded-lg ${
            isCorrect(selected) 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <h3 className="font-semibold mb-2">
              {isCorrect(selected) ? '✓ Correct!' : '✗ Incorrect'}
            </h3>
            <p className="text-sm">
              {isCorrect(selected)
                ? `Great job! You correctly identified the ${question.category === 'IDENT4' ? 'weapon' : 'vehicle'}.`
                : `The correct answer is: ${correctText}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
