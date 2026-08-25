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
        axios.get(`http://217.71.129.139:4795/passes/${id}`)
            .then(response => {setCurrentPass(response.data); setError('');})
            .catch(error => {
                setError("Ошибка: не удалось загрузить данные с сервера.");
            });
    }, [id, setCurrentPass]);

    const handleDelete = () => {
        if (window.confirm("Вы уверены, что хотите удалить данный пропуск?")) {
            axios.delete(`http://217.71.129.139:4795/passes/${id}`)
                .then(() => {
                    alert("Пропуск удален");
                    setError('');
                    navigate('/');
                })
                .catch(error => {
                    setError("Ошибка: не удалось удалить пропуск.");
                });
        }
    };

    if (!currentPass) {
        return <div>Загрузка информации о пропуске N{id}...</div>;
    }

    return (
        <div className="container">
            <h1>Информация о пропуске №{id}</h1>
            
            {error && <div className="error-box">{error}</div>}

            <div className="details-card">
                <p><strong>ФИО Владельца: </strong>{currentPass.owner}</p>
                <p><strong>Должность: </strong>{currentPass.position}</p>
                <p><strong>Дата рождения: </strong>{currentPass.birthDate}</p>
                <hr style={{borderColor: '#e2e8f0', margin: '15px 0'}} />
                <p><strong>Тип пропуска: </strong>{currentPass.passType}</p>
                <p><strong>Разрешенная зона: </strong>{currentPass.accessZone}</p>
                <p><strong>Выдан: </strong>{currentPass.issueDate}</p>
                <p><strong>Действителен до: </strong>{currentPass.validUntil}</p>
                <hr style={{borderColor: '#e2e8f0', margin: '15px 0'}} />
                <p><strong>Текущий статус: </strong>
                    <span className={`status-badge ${currentPass.status === 'Активен' ? 'status-active' : 'status-canceled'}`}>
                        {currentPass.status}
                    </span>
                </p>
            </div>

            <div className="actions-layout">
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