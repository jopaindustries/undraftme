import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './App.less';
import Question from './components/Question';
import Spinner from './components/Spinner/Spinner';

import {API_URL} from './constant';
import num2str from './constant';

function App() {

    const [questions, setQuestions] = useState(null);
    const [reports, setReports] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingError, setIsLoadingError] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState(false);
    const [activeTab, setActiveTab] = useState('requests');

    useEffect(() => {
        checkForUpdates();
    }, []);

    useEffect(() => {
        if (activeTab === 'reports') {
            checkForReports();
        } else if (activeTab === 'requests') {
            checkForUpdates();
        }
    }, [activeTab])

    function checkForUpdates() {
        setIsLoading(true);
        axios.get(API_URL + "/api/getSuggestedQuestions")
        .then((response) => {
            setIsLoading(false)
            console.log(response)
            if (response.data && response.data.attachment) {
                setQuestions(response.data.attachment)
            } else {
                setQuestions(null);
                setIsLoadingError(true);
            }
        })
        .catch(err => {
            setIsLoading(false)
            setIsLoadingError(true);
            console.error(err);
        })
    }

    function checkForReports() {
        setIsLoading(true);
        axios.get(API_URL + "/api/reportedQuestions")
        .then((response) => {
            setIsLoading(false);
            if (response.data && response.data.attachment) {
                setReports(response.data.attachment);
                console.log(response.data.attachment);   
            }
        })
    }

    function updateCategoryFilter(category) {
        if (category === categoryFilter) {
            setCategoryFilter(false);
        } else {
            setCategoryFilter(category);
        }
        window.scrollTo(0,0);
    }

    function setQuestionProcessed(question_id, status) {
        let all_questions = [...questions];
        let found_question_index = questions.findIndex(q => {
            return q._id === question_id
        });

        if (found_question_index >= 0) {
            all_questions[found_question_index]["isProcessed"] = status;
            setQuestions(all_questions);
            console.log('Question processed -', question_id)
        } else {
            console.error('Cannot find question with id to set processed -', question_id);
        }
    }

    function switchTab(tab_id) {
        setActiveTab(tab_id);
    }

    let questionsCount = questions && questions.length || 0;
    if (questionsCount > 0) {
        let filterByProcessed = questions.filter(q => {
            return q.isProcessed === undefined
        });
        questionsCount = filterByProcessed.length;
    }
    let reportsCount = reports ? reports.length : 0;

    let filtered = questions;
    if (categoryFilter) {
        filtered = filtered.filter(q => {
            return q.category === categoryFilter
        });
    }

    return(
        <div className="app">
            <div className="header">
                <div className="logo" onClick={checkForUpdates} />
                <div className="statistics">
                    {activeTab === 'requests' && questions && !isLoading && <div className="questions-count">{questionsCount + ' ' + num2str(questionsCount, ['вопрос', 'вопроса', 'вопросов'])}</div>}
                    {activeTab === 'reports' && reports && !isLoading && <div className="questions-count">{reportsCount + ' ' + num2str(reportsCount, ['обращение', 'обращения', 'обращений'])}</div>}
                    {isLoading && <Spinner />}
                    {isLoadingError && <div className="questions-error">Ошибка</div>}
                </div>
            </div>
            <div className="epic">
                <div className={"epic-button" + (activeTab === 'requests' ? ' active' : '')} onClick={() => switchTab('requests')}>Вопросы</div>
                <div className={"epic-button" + (activeTab === 'reports' ? ' active' : '')} onClick={() => switchTab('reports')}>Жалобы</div>
            </div>
            {activeTab === 'requests' && 
            <div className="container">
                {!questions && !isLoadingError && <Question preview={true} />}
                {isLoadingError && 
                    <div className="question">
                        <p className="error">Ошибка в соединении с сервером.</p>
                    </div>
                }
                {filtered && filtered.length > 0 &&
                filtered.map(question => {
                    return <Question 
                            key={question._id} 
                            onProcessed={setQuestionProcessed} 
                            onCategoryClick={updateCategoryFilter} 
                            info={question} 
                        />
                })
                }
            </div>
            }

            {activeTab === 'reports' && 
            <div className="container">
                {!questions && !isLoadingError && <Question preview={true} />}
                {isLoadingError && 
                    <div className="question">
                        <p className="error">Ошибка в соединении с сервером.</p>
                    </div>
                }
                {reports && reports.map(question => {
                    return <Question 
                            key={question._id} 
                            onProcessed={setQuestionProcessed} 
                            onCategoryClick={updateCategoryFilter} 
                            info={question} 
                        />
                })
                }
            </div>
            }
        </div>
    )
}

export default App;