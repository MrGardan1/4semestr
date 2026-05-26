import React, {useState, useContext, useEffect} from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { PassContext } from '../context/PassContext';

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {currentPass, setCurrentPass} = useContext(PassContext);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://217.71.129.139:5754/passes/${id}`)
            .then(response => {setCurrentPass(response.data); setError('');})
            .catch(error => {
                console.error("Ошибка получения данных: ", error);
                if (error.response) {
                    const status = error.response.status;
                    if (status === 400) {
                        setError("Ошибка 400: Bad Request");
                    } else if (status === 404) {
                        setError("Ошибка 404: Not Found");
                    } else if (status === 500) {
                        setError("Ошибка 500: Internal Server Error");
                    } else {
                        setError(`Ошибка: код ${status}`);
                    }
                } else {
                    setError("Ошибка: не удалось подключится к серверу");
                }
            });
    }, [id, setCurrentPass]);

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить данный пропуск?")) {
            axios.delete(`http://217.71.129.139:5754/passes/${id}`)
                .then(() => {
                    alert("Пропуск удален");
                    setError('');
                    navigate('/');
                })
                .catch(error => {
                    console.error("Ошибка удаления: ", error);
                    if (error.response) {
                        const status = error.response.status;
                        if (status === 400) {
                            setError("Ошибка 400: Bad Request");
                        } else if (status === 404) {
                            setError("Ошибка 404: Not Found");
                        } else if (status === 500) {
                            setError("Ошибка 500: Internal Server Error");
                        } else {
                            setError(`Ошибка: код ${status}`);
                        }
                    } else {
                        setError("Ошибка: не удалось подключиться к серверу");
                    }
                });
        }
    };

    if (!currentPass) {
        return <div>Загрузка информации о пропуске N{id}...</div>;
    }

    return (
        <div className="container">
            <h1>Информация о пропуске {id}</h1>
            <div className="detail-card">
                <p><strong>ФИО Владельца: </strong>{currentPass.owner} </p>
                <p><strong>Зона доступа: </strong>{currentPass.accessZone}</p>
                <p><strong>Статус: </strong>
                    <span className={`status-badge ${currentPass.status === 'Активен' ? 'status-active' : 'status-canceled'}`}>
                        {currentPass.status}
                    </span>
                </p>
            </div>

            <div className="action-layout">
                <Link to={`/edit/${id}`} className="btn btn-secondary" style={{textDecoration: 'none'}}>
                    Редактировать
                </Link>
                <button onClick={handleDelete} className="btn btn-danger">
                    Удалить пропуск
                </button>
            </div>

            <br/>
            <Link to="/" className="btn btn-secondary" style={{textDecoration: 'none', display: 'inline-block', marginTop: '10px'}}>
                Назад к списку
            </Link>
            
        </div>
    );

};

export default Detail;