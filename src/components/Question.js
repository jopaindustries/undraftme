import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import './question.less';

import approveIcon from '../assets/images/icon_approve.svg';
import declineIcon from '../assets/images/icon_decline.svg';
import Spinner from './Spinner/Spinner';

import {CATEGORIES} from '../constant.js';
import {API_URL} from '../constant.js';


function Question(props) {

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(undefined);
    const [questionText, setQuestionText] = useState('');
    const [questionExplanation, setQuestionExplanation] = useState('');
    const textarea = useRef(false);
    const explanationArea = useRef(false);
    
    // Props

    const {info} = props;
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
    }, []);

    useEffect(() => {
        calculateTextareaHeight(textarea);
    }, [questionText])

    useEffect(() => {
        calculateTextareaHeight(explanationArea)
    }, [questionExplanation])

    useEffect(() => {
        if (processingStatus !== undefined && processingStatus !== false) {
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
    function approveQuestion() {
        
        if (!info || !info._id) return false;

        setIsProcessing(true);
        setProcessingStatus(0);

        axios.patch(API_URL + '/api/approveQuestion', {
            questionID: info._id,
            newText: questionText,
            newAnswers: answers,
            newExplanation: questionExplanation || ''
        })
        .then((response) => {
            console.log(response);
            if (response.data && response.data.code === 200) {
                setProcessingStatus(200); 
            } else {
                setProcessingStatus(500)
            }
        })
        .catch((err) => {
            console.error(err);
            setProcessingStatus(500);
        });
    }

    /**
     * Decline user question on the server.
     */
    function declineQuestion() {
        if (!info || !info._id) {return false}
        setIsProcessing(true);
        setProcessingStatus(1);

        axios.delete(API_URL + '/api/declineQuestion', {
            data: {
                questionID: info._id
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

    /**
     * Retry last processing. 
     */
    function retryProcess() {
        //TestQuestionProcessing(processingStatus % 100);
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
            501: 'Не удалось удалить вопрос.'
        };
        return statusBoard[processingStatus] || 'Неизвестная ошибка.' 
    }

    return(
        <div className="question">
            
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
            <div>
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
                    {answers && answers.length > 0 && 
                        answers.map(answer => {
                            return <div key={Math.random()*10000} className={"answer" + (props.preview ? ' preview' : '')}>
                                {props.preview ? "" : answer}
                                </div>
                        })
                    }
                </div>
                
                {questionExplanation &&
                <div className="question-explanation">
                    <textarea rows={1} ref={explanationArea} onChange={(e) => {setQuestionExplanation(e.target.value)}} value={questionExplanation}></textarea>
                </div>
                }
                
                <div className="userinfo">
                        <div className="userpic" style={{backgroundImage: "url(" + (props.preview ? "https://sun9-39.userapi.com/c857632/v857632207/1a4b9e/HdexUlSEQdU.jpg" : photo) + ")"}} />
                        <div className="username">
                            <h2 className={props.preview ? 'preview' : ''}>{props.preview ? '' : userName}</h2>
                        </div>
                    </div>
                <div className="mobile-actions">
                <div className="action approve" onClick={approveQuestion}>
                    <div className="icon">
                        <img src={approveIcon} />
                    </div>
                </div>
                <div className="action decline" onClick={declineQuestion}>
                    <div className="icon">
                        <img src={declineIcon} />
                    </div>
                </div>
            </div>
            </div>
            }
        </div>
    )
}

export default Question;