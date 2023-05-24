import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import quizData from './data.json';
import './QuizComponent.css';

interface Question {
  question: string;
  options: string[];
  answer: string;
  hint: string;
  hint2: string;
  correctCount: number;
  answerTimes: number[];
}

interface QuizData {
  questions: Question[];
}

const QuizComponent: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [hintContent, setHintContent] = useState<React.ReactNode>(null);
  const [questionContent, setQuestionContent] = useState<React.ReactNode>(null);

  const data: QuizData = quizData as QuizData;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    shuffleQuestions();
  }, []);

  useEffect(() => {
    if (timer === 10 && !showHint) {
      setShowHint(true);
    } else if (timer === 20 && showHint) {
      setShowHint(false);
    } else if (timer === 30 && !showHint) {
      setShowHint(true);
    }
    setHintContent(
      <div dangerouslySetInnerHTML={{ __html: currentQuestionData.hint }} />
    );
    setQuestionContent(
      <div dangerouslySetInnerHTML={{ __html: currentQuestionData.question }} />
    );
  }, [timer, showHint]);

  useEffect(() => {
    if (currentQuestion < data.questions.length) {
      setShuffledOptions(shuffleArray(data.questions[currentQuestion].options));
    }
  }, [currentQuestion, data.questions]);

  const shuffleArray = (array: any[]): any[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const shuffleQuestions = (): void => {
    const shuffledQuestions = shuffleArray(data.questions);
    setCurrentQuestion(0); // Set the current question to the first question after shuffling
    data.questions = shuffledQuestions;
  };

  const handleOptionSelect = (option: string): void => {
    setSelectedOption(option);
  };

  const currentQuestionData = data.questions[currentQuestion];

  const handleNextQuestion = (): void => {
    if (selectedOption === currentQuestionData.answer) {
      setScore((prevScore) => prevScore + 1);

      // 문제를 맞춘 시간과 맞춘 횟수를 기록
      const currentTime = new Date().getTime();
      const updatedQuestion = {
        ...currentQuestionData,
        correctCount: currentQuestionData.correctCount + 1,
        answerTimes: [...currentQuestionData.answerTimes, currentTime],
      };
      data.questions[currentQuestion] = updatedQuestion;
    } else {
      setModalTitle('오답');
      setModalContent(
        <div dangerouslySetInnerHTML={{ __html: currentQuestionData.hint2 }} />
      );
      setShowModal(true);
    }

    if (currentQuestion + 1 < data.questions.length) {
      setCurrentQuestion((prevQuestion) => prevQuestion + 1);
      setSelectedOption(null); // Reset selected option
      setShowHint(false); // Reset hint visibility
      setTimer(0); // Reset timer
    } else {
      setShowResult(true);
    }
  };

  const handleResetQuiz = (): void => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setTimer(0);
  };

  const formatTime = (time: number): string => {
    const currentTime = Math.round(Date.now() / 1000);
    const elapsedSeconds = currentTime - time;
    const minutes = Math.floor(elapsedSeconds / 60);

    if (minutes === 0) {
      return "방금 전";
    } else if (minutes === 1) {
      return "1분 전";
    } else {
      return `${minutes}분 전`;
    }
  };

  return (
    <div className="quiz-wrapper">
      <div className="header">
        <div className="timer">타이머: {timer}초</div>
        <div className="score">맞힌 개수: {score}</div>
        {currentQuestionData && !showResult && (
          <div className="stats">
            <div className="correct-count">
              맞힌 횟수: {currentQuestionData.correctCount}
            </div>
            <div className="average-time">
              평균 시간:{" "}
              {currentQuestionData.answerTimes.length > 0
                ? formatTime(
                    Math.round(
                      currentQuestionData.answerTimes.reduce(
                        (total: number, time: number) => total + time,
                        0
                      ) / currentQuestionData.answerTimes.length / 1000
                    )
                  )
                : "0분 전"}
            </div>
          </div>
        )}
      </div>

      {showResult ? (
        <div className="result">
          <h2>결과</h2>
          <p className="result-score">
            점수: {score} / {data.questions.length}
          </p>
          <button className="reset-button" onClick={handleResetQuiz}>
            다시 시작
          </button>
        </div>
      ) : (
        <div className="content-wrapper">
          <div className="question-wrapper">
            <p>{questionContent}</p>
          </div>

          <div className="options-wrapper">
            <ul className="options-list">
              {shuffledOptions.map((option: string, index: number) => (
                <li key={index}>
                  <button
                    className={`option-button ${
                      selectedOption === option ? 'selected' : ''
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            className={`next-button ${
              selectedOption === null ? 'disabled' : ''
            }`}
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            다음
          </button>

          {showHint && (
            <div className="hint-wrapper">
              <h3>힌트</h3>
              <p>{hintContent}</p>
            </div>
          )}
        </div>
      )}

<Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel={modalTitle}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          content: {
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center',
          },
        }}
      >
        <h2>{modalTitle}</h2>
        <div className="modal-content">{modalContent}</div>
        <button onClick={() => setShowModal(false)}>확인</button>
      </Modal>
    </div>
  );
};

export default QuizComponent;
