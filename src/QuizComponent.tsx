import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import quizData from './data.json';
import './QuizComponent.css';

interface Question {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

interface QuizData {
  questions: Question[];
}

interface ModalContentProps {
  title: string;
  content: string;
  onClose: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({ title, content, onClose }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      <button onClick={onClose}>확인</button>
    </div>
  );
};

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
  const [modalContent, setModalContent] = useState<string>('');

  const data: QuizData = quizData;

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
    } else {
      setModalTitle('오답');
      setModalContent('다음 문제로 넘어갑니다.');
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

  const closeModal = (): void => {
    setShowModal(false);
  };

  return (
    <div className="quiz-wrapper">
      <div className="header">
        <div className="timer">타이머: {timer}초</div>
        <div className="score">맞힌 개수: {score}</div>
      </div>

      {showResult ? (
        <div>
          <h2>결과</h2>
          <p>
            점수: {score} / {data.questions.length}
          </p>
          <button onClick={handleResetQuiz}>다시 시작</button>
        </div>
      ) : (
        <div className="content-wrapper">
          <div className="question-wrapper">
            <p>{currentQuestionData.question}</p>
          </div>

          <div className="options-wrapper">
            <ul className="options-list">
              {shuffledOptions.map((option: string, index: number) => (
                <li key={index}>
                  <button
                    className={`option-button ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            className={`next-button ${selectedOption === null ? 'disabled' : ''}`}
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            다음 문제
          </button>
          <div className="hint-wrapper">
            {timer >= 5 && showHint && <p>{currentQuestionData.hint}</p>}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onRequestClose={closeModal}>
        <ModalContent title={modalTitle} content={modalContent} onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default QuizComponent;
