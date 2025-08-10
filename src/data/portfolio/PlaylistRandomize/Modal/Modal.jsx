import React from 'react';
import ModalContainer from '@/Components/ModalContainer/ModalContainer';
import './Modal.css';

const Modal = ({
  showModal,
  modalType,
  questions,
  setQuestions,
  successMessage,
  onClose,
  onTokenChoice,
  onSubmitQuestions,
  isLoading
}) => {
  return (
    <ModalContainer
      isOpen={showModal}
      onClose={onClose}
      size="medium"
      className="playlist-modal"
      closeOnOverlayClick={true}
      showCloseButton={true}
    >
      <div className="modal-header">
        <h3 className="modal-title">
          {modalType === 'token-choice' && 'Token 選項'}
          {modalType === 'tutorial' && '獲取 Token 教學'}
          {modalType === 'questions' && '驗證問題'}
          {modalType === 'token-success' && 'Token 獲取成功'}
        </h3>
      </div>

      <div className="modal-content">
        {modalType === 'token-choice' && (
          <div>
            <p>您尚未提供 API Token。請選擇以下選項：</p>
            <div className="button-group" style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => onTokenChoice('self')}
              >
                自行獲取 Token
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onTokenChoice('server')}
              >
                使用伺服器 Token
              </button>
            </div>
          </div>
        )}

        {modalType === 'tutorial' && (
          <div>
            <hr />
            <h4>如何獲取 YouTube API Token：</h4>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>前往 <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Cloud Console
              </a></li>
              <li>建立新專案或選擇現有專案（預設為 My First Project）</li>
              <li>選擇 API 和服務</li>
              <li>選擇 啟用 API 和服務</li>
              <li>搜尋並啟用 YouTube Data API v3</li>
              <li>選擇憑證 -&gt; 建立憑證 -&gt; API 金鑰</li>
              <li>複製生成的 API 金鑰</li>
              <li>將金鑰貼到 Token 輸入框中</li>
            </ol>
            <div className="button-group" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={onClose}>
                我知道了
              </button>
            </div>
          </div>
        )}

        {modalType === 'questions' && (
          <div>
            <p>請回答以下問題以透過伺服器獲取播放清單：</p>
            <div className="question-form">
              <div className="question-group">
                <label className="question-label">問題 1: 你的名字（暱稱）是什麼？</label>
                <input
                  type="text"
                  className="input-field"
                  value={questions.question1}
                  onChange={(e) => setQuestions({ ...questions, question1: e.target.value })}
                  placeholder="請輸入答案"
                />
              </div>
              <div className="question-group">
                <label className="question-label">問題 2: 請寫出一個我使用過的遊戲名稱</label>
                <input
                  type="text"
                  className="input-field"
                  value={questions.question2}
                  onChange={(e) => setQuestions({ ...questions, question2: e.target.value })}
                  placeholder="Deeelol 或 Tony 都不是答案"
                />
              </div>
              <div className="question-group">
                <label className="question-label">問題 3: 推薦我一個東西（歌、遊戲、菜餚等任何你覺得很棒的）</label>
                <input
                  type="text"
                  className="input-field"
                  value={questions.question3}
                  onChange={(e) => setQuestions({ ...questions, question3: e.target.value })}
                  placeholder="請輸入答案"
                />
              </div>
              <div className="button-group">
                <button
                  className="btn btn-primary"
                  onClick={onSubmitQuestions}
                  disabled={isLoading}
                >
                  {isLoading ? '提交中...' : '提交答案'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'token-success' && (
          <div>
            <div className="success-message">
              <div className="success-icon">✅</div>
              <div className="success-text">
                {successMessage.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
            <div className="button-group" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={onClose}>
                關閉
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalContainer>
  );
};

export default Modal;
