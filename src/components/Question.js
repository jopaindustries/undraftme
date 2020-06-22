import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import './question.less';

import approveIcon from '../assets/images/icon_approve.svg';
import declineIcon from '../assets/images/icon_decline.svg';
import rewriteIcon from '../assets/images/icn24_rewrite.svg'
import Spinner from './Spinner/Spinner';

import {CATEGORIES} from '../constant.js';
import {API_URL} from '../constant.js';


function Question(props) {

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(undefined);
    const [questionText, setQuestionText] = useState('');
    const [questionExplanation, setQuestionExplanation] = useState('');
    const [questionAnswers, setQuestionAnswers] = useState([]);
    const textarea = useRef(false);
    const explanationArea = useRef(false);
    const [isRemoveExplationPressed, setIsRemoveExplanationPresed] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [declineCode, setDeclineCode] = useState(10);
    const [declineReason, setDeclineReason] = useState('');
    
    const [isReported, setIsReported] = useState(false);
    // Props

    const {info} = props;
    const isUser = info && info.requestedBy;
    const reports = info && info.reports;
    const userName = (info && info.requestedBy && (info.requestedBy.first_name + ' ' + info.requestedBy.last_name));
    const photo = (info && info.requestedBy && info.requestedBy.photo);
    const answers = (info && info.answers);
    const category = (info && info.category);
    const {isProcessed} = props;

    useEffect(() => {
        if (props.info && props.info.isProcessed !== undefined) {
            console.log('processed status', props.info.isProcessed)
            setProcessingStatus(props.info.isProcessed)
            setIsProcessing(true);
        }

        if (props.info && props.info.text) {
            setQuestionText(props.info.text);
        }

        if (props.info && props.info.explanation) {
            setQuestionExplanation(props.info.explanation);
        }

        if (props.info && props.info.answers) {
            setQuestionAnswers(props.info.answers);
        }

        if (props.info && props.info.reports && props.info.reports.length > 0) {
            setIsReported(true);
        }
    }, []);

    useEffect(() => {
        calculateTextareaHeight(textarea);
    }, [questionText])

    useEffect(() => {
        calculateTextareaHeight(explanationArea)
    }, [questionExplanation])

    useEffect(() => {
        if (processingStatus !== undefined && processingStatus !== false && !isReported) {
            setProcessedFlag();
        }
    }, [processingStatus])
    

    // Methods

    function TestQuestionProcessing(type, isError) {
        setIsProcessing(true);
        setProcessingStatus(type);
        setTimeout(() => {
            setProcessingStatus(type + (isError ? 500 : 200));
        }, 1200)
    }

    /**
     * Approve user question on the server.
     */
    function approveQuestion(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!info || !info._id) return false;

        
        setIsProcessing(true);
        setProcessingStatus(isReported ? 2 : 0);

        axios.patch(API_URL + (!isReported ? '/api/approveQuestion' : '/api/editQuestion'), {
            questionID: info._id,
            newText: questionText,
            newAnswers: questionAnswers,
            newExplanation: questionExplanation && questionExplanation.length > 0 ? questionExplanation : undefined
        })
        .then((response) => {
            console.log(response);
            if (response.data && response.data.code === 200) {
                setProcessingStatus(isReported ? 202 : 200); 
            } else {
                setProcessingStatus(isReported ? 502 : 500)
            }
        })
        .catch((err) => {
            console.error(err);
            setProcessingStatus(isReported ? 502 : 500);
        });
    }

    /**
     * Decline user question on the server.
     */
    function declineQuestion() {
        if (!info || !info._id) {return false}
        setIsProcessing(true);
        setProcessingStatus(1);

        console.log('declining with code...', declineCode);
        axios.delete(API_URL + (!isReported ? '/api/declineQuestion' : '/api/question'), {
            data: {
                questionID: info._id,
                code: declineCode,
                reason: declineReason.length > 0 ? declineReason : undefined
            }
        })
        .then((response) => {
            console.log(response);
            if (response.data && response.data.code === 200) {
                setProcessingStatus(201);  
            } else {
                setProcessingStatus(501)
            }
        })
        .catch((err) => {
            console.error(err);
            setProcessingStatus(501);
        })
    }

    function closeReports(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!info || !info._id) return false;

        setIsProcessing(true);
        setProcessingStatus(3);

        axios.get(API_URL + '/api/clearQuestionReports', {
            params: {questionID: info._id}
        })
        .then((response) => {
            if (response.data && response.data.code === 200) {
                setProcessingStatus(203); 
            } else {
                setProcessingStatus(503); 
            }
        })
        .catch(err => {
            console.log(err);
            setProcessingStatus(503);
        })
    }

    function setProcessedFlag() {
        if (props.onProcessed && typeof props.onProcessed === 'function') {
            props.onProcessed(info._id, processingStatus);
        }
    }

    function calculateTextareaHeight(textarea) {
        if (textarea && textarea.current) {
            let pole = textarea.current;
            pole.style.height = 'auto';
            let height = pole.scrollHeight;
            pole.style.height = height  + 'px';
        }
    }

    function handleTextChange(e) {
        setQuestionText(e.target.value);
    }

    function removeExplanation(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isRemoveExplationPressed) {
            setIsRemoveExplanationPresed(false);
            setQuestionExplanation('');
        }
    }

    /**
     * Retry last processing. 
     */
    function retryProcess() {
        let processType = processingStatus % 100;
        if (processType === 0) {
            approveQuestion();
        } else if (processType === 1) {
            declineQuestion();
        }
    }

    function applyFilter() {
        if (props.onCategoryClick && typeof props.onCategoryClick === 'function') {
            props.onCategoryClick(category);
        }
    }

    function getProcessingStatusMessage() {
        let statusBoard = {
            0: 'Одобрение вопроса...',
            500: 'Ошибка одобрения вопроса.',
            200: 'Вопрос одобрен.',
            1: 'Удаление вопроса...',
            201: 'Вопрос успешно удалён.',
            501: 'Не удалось удалить вопрос.',
            2: 'Вопрос обновляется...',
            202: 'Вопрос успешно обновлен.',
            502: 'Не удалось обновить вопрос.',
            3: 'Завершение обращений...',
            203: 'Все обращения закрыты.',
            503: 'Не удалось закрыть обращение.'
        };
        return statusBoard[processingStatus] || 'Неизвестная ошибка.' 
    }

    function setDecliningCode(code) {
        setDeclineCode(code);

        // Clear reason if this is no more custom code.
        if (code !== 16) {
            setDeclineReason('');
        }
    }

    return(
        <div className="question">

            {isDeclining && !isProcessing &&
            <div className="declining">
                <h2>Причина отклонения</h2>
                <div className="codes">
                    <div className={"decline-code" + (declineCode === 10 ? ' checked' : '')} onClick={() => setDecliningCode(10)}>Копия чужого вопроса</div>
                    <div className={"decline-code" + (declineCode === 11 ? ' checked' : '')}  onClick={() => setDecliningCode(11)}>Нет образовательного подтекста</div>
                    <div className={"decline-code" + (declineCode === 12 ? ' checked' : '')} onClick={() => setDecliningCode(12)}>Непостоянная информация</div>
                    <div className={"decline-code" + (declineCode === 13 ? ' checked' : '')} onClick={() => setDecliningCode(13)}>Ненормативная лексика</div>
                    <div className={"decline-code" + (declineCode === 14 ? ' checked' : '')} onClick={() => setDecliningCode(14)}>Некорректный набор ответов</div>
                    <div className={"decline-code" + (declineCode === 15 ? ' checked' : '')} onClick={() => setDecliningCode(15)}>Невозможно проверить правильность ответа</div>
                    <div className={"decline-code" + (declineCode === 16 ? ' checked' : '')} onClick={() => setDecliningCode(16)}>Особое решение администрации</div>
                </div>
                {declineCode === 16 &&
                    <div className="decline-reason">
                        <textarea 
                            placeholder="Введите пояснение..."
                            onChange={(e) => {setDeclineReason(e.target.value)}} 
                            value={declineReason} />
                    </div>
                }
                <div className="confirm-decline" onClick={declineQuestion}>Отклонить вопрос</div>
                <div className="confirm-decline cancel" onClick={() => setIsDeclining(false)}>Отмена</div>
            </div>
            }
            
            {/* Processing content. Displays when question is accepted or declined. */}
            {isProcessing &&
            <div className="question--processing">
                {processingStatus < 100 && <Spinner />}
                <p>{getProcessingStatusMessage()}</p>
                {Math.round(processingStatus / 100) === 5 &&
                <div className="retryProcess" onClick={retryProcess}>Повторить</div>
                }
            </div>
            }

            {/* Question content. Header, text, answers and explanation. */}
            {!isProcessing &&
            <div style={isDeclining ? {display: 'none'} : {}}>
                <div className="question-header">
                    <div onClick={applyFilter} className={"question-category " + (category ? category : '')}>
                        {CATEGORIES[category]}
                    </div>
                    <div className="question-header--actions">
                        {isProcessing && <Spinner />}
                        <div className="action approve">
                            <div className="icon">
                                <img src={approveIcon} />
                            </div>
                        </div>
                        <div className="action decline">
                            <div className="icon">
                                <img src={declineIcon} />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="question-text">
                    {!props.preview && <textarea rows={1} ref={textarea} onChange={handleTextChange} value={questionText}></textarea>}
                    {props.preview && 
                        <div className="preview-text">
                            <div className="preview-text--block" />
                            <div className="preview-text--block" />
                            <div className="preview-text--block" />
                            <div className="preview-text--block" />
                            <div className="preview-text--block" />
                            <div className="preview-text--block" />
                        </div>
                    }
                </div>

                <div className="question-answers">
                    {questionAnswers && questionAnswers.length > 0 &&
                        questionAnswers.map((val, i, questionAnswers) => {
                            return <input 
                                    key={info._id + '-ans' + i} 
                                    value={props.preview ? "" : questionAnswers[i]} 
                                    onChange={(e) => { let tmp_answers = [...questionAnswers]; tmp_answers[i] = e.target.value; setQuestionAnswers(tmp_answers);}} 
                                    className={"answer" + (props.preview ? ' preview' : '')} />
                        })
                    }
                </div>
                
                <div className="question-explanation">
                    <textarea rows={1} placeholder="Введите пояснение..." ref={explanationArea} onChange={(e) => {setQuestionExplanation(e.target.value)}} value={questionExplanation}></textarea>
                    {questionExplanation && questionExplanation.length > 0 && 
                    <div 
                        className={"delete-explanation" + (isRemoveExplationPressed ? ' pressed' : '')} 
                        onTouchStart={() => {setIsRemoveExplanationPresed(true)}} 
                        onTouchEnd={removeExplanation} 
                        onTouchCancel={() => setIsRemoveExplanationPresed(false)} 
                        onTouchMove={() => setIsRemoveExplanationPresed(false)}>
                            Удалить пояснение
                    </div>
                    }
                </div>
                
                {isUser !== 0 && 
                <div className="userinfo">
                    <div className="userpic" style={{backgroundImage: "url(" + (props.preview ? "https://sun9-39.userapi.com/c857632/v857632207/1a4b9e/HdexUlSEQdU.jpg" : photo) + ")"}} />
                    <div className="username">
                        <h2 className={props.preview ? 'preview' : ''}>{props.preview ? '' : userName}</h2>
                    </div>
                </div>
                }
                {isUser === 0 && <br/>}
                
                <div className="mobile-actions">
                    <div className="action approve" onClick={approveQuestion} onTouchEnd={approveQuestion}>
                        <div className="icon">
                            <img src={isReported ? rewriteIcon : approveIcon} />
                        </div>
                        {isReported && <div className="label">Обновить вопрос</div>}
                    </div>
                    <div className="action decline" onClick={() => setIsDeclining(true)}>
                        <div className="icon">
                            <img src={declineIcon} />
                        </div>
                        {isReported && <div className="label">Удалить вопрос</div>}
                    </div>
                </div>

                {reports && 
                <div className="reports">
                    <h3>Жалобы пользователей</h3>
                    {reports.map(report => {
                        return <div key={Math.random() * 10000} className="report">{report}</div>
                    })}
                    <div className="close-report" onClick={closeReports}>Закрыть обращения</div>
                </div>
                }
            </div>
            }
        </div>
    )
}

export default Question;