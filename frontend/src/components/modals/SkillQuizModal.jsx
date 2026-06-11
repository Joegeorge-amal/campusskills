import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getQuizForSkill } from '../../data/quizData';
import { IconCircleCheckFilled, IconAlertTriangleFilled, IconClock, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const SkillQuizModal = ({ isOpen, skillName, onClose, onComplete }) => {
  const [step, setStep] = useState('quiz'); // 'quiz', 'confirm', 'pass', 'fail'
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (isOpen && skillName) {
      setQuizData(getQuizForSkill(skillName));
      setStep('pass');
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(15 * 60);
      setFinalScore(100);
    }
  }, [isOpen, skillName]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isOpen && step === 'quiz' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 'quiz') {
      handleCalculateScore();
    }
    return () => clearInterval(timer);
  }, [isOpen, step, timeLeft]);

  if (!isOpen || !quizData) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('confirm');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCalculateScore = () => {
    let correctCount = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) {
        correctCount++;
      }
    });
    
    const scorePct = Math.round((correctCount / quizData.questions.length) * 100);
    setFinalScore(scorePct);
    
    if (scorePct >= 70) {
      setStep('pass');
    } else {
      setStep('fail');
    }
  };

  const handleReturnToProfile = () => {
    if (step === 'pass') {
      onComplete(skillName, finalScore, quizData.domain);
    } else {
      // Just close if fail
      onClose();
    }
  };

  const renderQuizStep = () => {
    const question = quizData.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    return (
      <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{skillName} Verification</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Question {currentQuestionIndex + 1} of {quizData.questions.length}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '8px 16px', borderRadius: '24px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
            <IconClock size={18} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '24px', lineHeight: 1.5 }}>
            {question.text}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentQuestionIndex] === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  style={{ 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: `2px solid ${isSelected ? '#534AB7' : '#e5e7eb'}`, 
                    background: isSelected ? '#f5f4ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    border: `2px solid ${isSelected ? '#534AB7' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#534AB7' }}></div>}
                  </div>
                  <div style={{ fontSize: '15px', color: isSelected ? '#3730a3' : '#4b5563', fontWeight: isSelected ? 600 : 500 }}>
                    {opt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button 
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            style={{ 
              padding: '12px 24px', borderRadius: '24px', border: '1px solid #e5e7eb', background: '#ffffff', 
              color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151', fontSize: '14px', fontWeight: 600, 
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            <IconChevronLeft size={18} /> Previous
          </button>
          
          <button 
            onClick={handleNext}
            style={{ 
              padding: '12px 32px', borderRadius: '24px', border: 'none', background: '#534AB7', 
              color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}
          >
            {isLastQuestion ? 'Finish' : 'Next'} {isLastQuestion ? '' : <IconChevronRight size={18} />}
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => (
    <div style={{ padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <IconAlertTriangleFilled size={64} style={{ color: '#eab308', marginBottom: '24px' }} />
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Submit Quiz?</div>
      <div style={{ fontSize: '15px', color: '#6b7280', maxWidth: '400px', marginBottom: '32px', lineHeight: 1.5 }}>
        Are you sure you want to submit? You will not be able to change your answers after submission.
      </div>
      
      <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '400px' }}>
        <button 
          onClick={() => setStep('quiz')}
          style={{ flex: 1, padding: '14px', borderRadius: '24px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          Go Back
        </button>
        <button 
          onClick={handleCalculateScore}
          style={{ flex: 1, padding: '14px', borderRadius: '24px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          Submit
        </button>
      </div>
    </div>
  );

  const renderPassStep = () => (
    <div style={{ padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <IconCircleCheckFilled size={80} style={{ color: '#10b981', marginBottom: '24px' }} />
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Congratulations!</div>
      <div style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>You passed the {skillName} verification quiz.</div>
      
      <div style={{ background: '#f3f4f6', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '300px', marginBottom: '32px' }}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Confidence Score</div>
        <div style={{ fontSize: '48px', fontWeight: 700, color: '#059669', lineHeight: 1 }}>{finalScore}%</div>
      </div>

      <button 
        onClick={handleReturnToProfile}
        style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '24px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
      >
        Return to Profile
      </button>
    </div>
  );

  const renderFailStep = () => (
    <div style={{ padding: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <IconAlertTriangleFilled size={80} style={{ color: '#ef4444', marginBottom: '24px' }} />
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Keep practicing!</div>
      <div style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px', maxWidth: '400px', lineHeight: 1.5 }}>
        You didn't pass the {skillName} verification this time. You scored {finalScore}%, but 70% is required to pass.
      </div>
      
      <button 
        onClick={handleReturnToProfile}
        style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '24px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
      >
        Return to Profile
      </button>
      
      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '24px' }}>
        You can retake this quiz in 24 hours.
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', paddingTop: '80px'
    }}>
      <style>{`
        .sqm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          animation: modalDropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes modalDropIn {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="sqm-wrapper">
        {step === 'quiz' && renderQuizStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'pass' && renderPassStep()}
        {step === 'fail' && renderFailStep()}
      </div>
    </div>,
    document.body
  );
};

export default SkillQuizModal;
