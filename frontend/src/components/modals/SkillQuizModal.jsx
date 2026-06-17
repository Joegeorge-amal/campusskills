import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { verificationService } from '../../services/verificationService';
import { IconCircleCheckFilled, IconAlertTriangleFilled, IconClock, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const SkillQuizModal = ({ isOpen, skillName, onClose, onComplete }) => {
  const [step, setStep] = useState('loading'); // 'loading', 'not_available', 'quiz', 'confirm', 'pass', 'fail', 'fail_cheat'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 mins
  const [finalScore, setFinalScore] = useState(0);
  const [debugMsg, setDebugMsg] = useState(null);
  
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningMsg, setShowWarningMsg] = useState('');
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && skillName) {
      setStep('loading');
      setWarningCount(0);
      setShowWarningMsg('');
      setAnswers({});
      setTimeLeft(10 * 60);
      setFinalScore(0);
      
      verificationService.getQuestions(skillName)
        .then(res => {
          if (!res || res.length === 0) {
            setStep('not_available');
          } else {
            setQuestions(res);
            setStep('quiz');
            setCurrentQuestionIndex(0);
            startTimeRef.current = Date.now();
          }
        })
        .catch(err => {
          console.error('Failed to load questions:', err);
          setStep('not_available');
        });
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOpen, skillName]);

  // Anti-Cheat Logic
  useEffect(() => {
    if (!isOpen || step !== 'quiz') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };
    
    const handleBlur = () => {
      handleTabSwitch();
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, step, warningCount]);

  const handleTabSwitch = () => {
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    
    if (newCount === 1) {
      setShowWarningMsg('Please remain on this tab. Switching tabs repeatedly will invalidate the verification.');
    } else if (newCount === 2) {
      setShowWarningMsg('Second warning. One more tab switch will fail the verification.');
    } else if (newCount >= 3) {
      handleForceFailCheat();
    }
    
    setTimeout(() => setShowWarningMsg(''), 5000);
  };

  const handleForceFailCheat = async () => {
    setStep('fail_cheat');
    try {
      await verificationService.submitVerification({
        skill: skillName,
        answers: {},
        failedDueToTabSwitch: true,
        warningCount: 3,
        startedAt: startTimeRef.current
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isOpen && step === 'quiz' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === 'quiz') {
      handleSubmitScore();
    }
    return () => clearInterval(timerRef.current);
  }, [isOpen, step, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optIndex) => {
    const question = questions[currentQuestionIndex];
    const qKey = question.question;
    const qId = question._id;
    setAnswers(prev => ({
      ...prev,
      [qKey]: optIndex,
      [qId]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
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

  const handleSubmitScore = async () => {
    setStep('loading');
    try {
      const res = await verificationService.submitVerification({
        skill: skillName,
        answers: answers,
        failedDueToTabSwitch: false,
        warningCount: warningCount,
        startedAt: startTimeRef.current
      });
      
      setFinalScore(res.score);
      setDebugMsg(res.debug);
      setStep(res.passed ? 'pass' : 'fail');
      if (res.passed) {
        onComplete(skillName, finalScore);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert("NETWORK ERROR: Could not connect to the backend!\nIf you are seeing this, your Java backend is definitely running the OLD code or is turned off. Please run 'mvn clean package -DskipTests' and restart it!");
      setStep('fail');
    }
  };

  const handleReturnToProfile = () => {
    if (step === 'pass') {
      onComplete(skillName, finalScore);
    } else {
      onClose();
    }
  };

  const renderContent = () => {
    if (step === 'loading') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Loading...
        </div>
      );
    }

    if (step === 'not_available') {
      return (
        <div style={{ padding: '32px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <IconAlertTriangleFilled size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Not Available</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            Verification not available for this skill yet.
          </p>
          <button onClick={onClose} style={{ padding: '12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Close
          </button>
        </div>
      );
    }

    if (step === 'fail_cheat') {
      return (
        <div style={{ padding: '32px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <IconAlertTriangleFilled size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginBottom: '16px' }}>Verification Failed</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            You switched tabs too many times. Your attempt has been recorded as a failure.
          </p>
          <button onClick={onClose} style={{ padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            Return to Profile
          </button>
        </div>
      );
    }

    if (step === 'quiz') {
      const question = questions[currentQuestionIndex];
      const isLastQuestion = currentQuestionIndex === questions.length - 1;
      const qId = question.question;

      return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {showWarningMsg && (
            <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
              {showWarningMsg}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#6b7280', fontWeight: 600 }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 60 ? '#ef4444' : '#1d4ed8', fontWeight: 700, background: timeLeft < 60 ? '#fee2e2' : '#eff6ff', padding: '6px 12px', borderRadius: '100px' }}>
              <IconClock size={18} />
              {formatTime(timeLeft)}
            </div>
          </div>

          <h3 style={{ fontSize: '20px', color: '#111827', marginBottom: '32px', lineHeight: '1.5' }}>
            {question.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                style={{
                  padding: '16px 20px',
                  border: answers[qId] === i ? '2px solid #1d4ed8' : '2px solid #e5e7eb',
                  background: answers[qId] === i ? '#eff6ff' : '#fff',
                  borderRadius: '12px',
                  textAlign: 'left',
                  fontSize: '15px',
                  color: '#374151',
                  fontWeight: answers[qId] === i ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  border: answers[qId] === i ? '6px solid #1d4ed8' : '2px solid #d1d5db',
                  background: '#fff'
                }} />
                {opt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '12px 24px', borderRadius: '8px', border: '1px solid #d1d5db',
                background: '#fff', color: '#374151', fontWeight: 600, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
            >
              <IconChevronLeft size={18} /> Previous
            </button>
            <button
              onClick={handleNext}
              disabled={answers[qId] === undefined}
              style={{
                padding: '12px 24px', borderRadius: '8px', border: 'none',
                background: answers[qId] === undefined ? '#93c5fd' : '#1d4ed8',
                color: '#fff', fontWeight: 600, cursor: answers[qId] === undefined ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isLastQuestion ? 'Review' : 'Next'} <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (step === 'confirm') {
      const answeredCount = Object.keys(answers).filter(k => k.length > 24 || k.includes(' ')).length;
      return (
        <div style={{ padding: '32px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Ready to submit?</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>
            You have answered {answeredCount} of {questions.length} questions.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => setStep('quiz')} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Go Back
            </button>
            <button onClick={handleSubmitScore} style={{ padding: '12px 24px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Submit Test
            </button>
          </div>
        </div>
      );
    }

    if (step === 'pass') {
      return (
        <div style={{ padding: '32px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <IconCircleCheckFilled size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Verification Passed!</h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            Score: <span style={{ fontWeight: 800, color: '#10b981' }}>{finalScore}%</span>
          </p>
          <button onClick={handleReturnToProfile} style={{ padding: '14px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
            Add to Profile
          </button>
        </div>
      );
    }

    if (step === 'fail') {
      return (
        <div style={{ padding: '32px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', fontWeight: 800 }}>
            !
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Not quite there yet</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
            You scored <strong style={{ color: '#ef4444' }}>{finalScore}%</strong>. A minimum of 60% is required to pass.
          </p>
          {debugMsg && (
            <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '12px', textAlign: 'left', overflowWrap: 'break-word', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
              <strong>DEBUG TRACE (Please send to AI):</strong><br/>
              {debugMsg}
            </div>
          )}
          <button onClick={handleReturnToProfile} style={{ marginTop: '24px', padding: '14px 24px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
            Return to Profile
          </button>
        </div>
      );
    }
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '600px', height: '600px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {renderContent()}
      </div>
    </div>,
    document.body
  );
};

export default SkillQuizModal;
