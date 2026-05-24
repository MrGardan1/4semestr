import React, {useState, useContext, useEffect, useRef} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import { PassContext } from '../context/PassContext';

const Edit = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {currentPass, setCurrentPass} = useContext(PassContext);

    const [error, setError] = useState('');

    const ownerRef = useRef(null);
    const accessZoneRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/passes/${id}`)
            .then(response => {setCurrentPass(response.data); setError('');})
            .catch(error => {
                console.error("Ошибка загрузки формы: ", error);

                if (error.response) {
                    const status = error.response.status;
                    if (status === 404) {
                        setError("Ошибка 404: Not Found");
                    } else if (status === 500) {
                        setError("Ошибка 500: Internal Server Error");
                    } else {
                        setError(`Ошибка сервера: код статуса ${status}`);
                    }
                } else {
                    setError("Ошибка: не удалось подключится к серверу");
                }
            });
    }, [id, setCurrentPass]);

    const handleSubmit = (e) => {
        e.preventDefault(); // без перезагрузки страницы

        const ownerValue = ownerRef.current.value.trim();
        const accessZoneValue = accessZoneRef.current.value.trim();

        if (ownerValue.length < 3) {
            setError("Ошибка: ФИО должно содержать минимум 3 буквы");
            return;
        }

        if (accessZoneValue.length < 2) {
            setError("Ошибка: зона доступа должна содержать минимум 2 символа");
            return;
        }

        setError('');

        const updateData = {
            owner: ownerValue,
            accessZone: accessZoneValue,
            status:statusRef.current.value
        };

        axios.put(`http://localhost:5000/passes/${id}`, JSON.stringify(updateData), {
            headers: {"Content-Type": "application/json"}
        })
        .then(() => {
            alert("Данные успешно сохранены");
            navigate(`/detail/${id}`);
        })
        .catch(error =>  {
            console.error("Ошибка обновления: ", error);
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    setError("Ошибка 400: Bad request");
                } else if (status === 404) {
                    setError("Ошибка 404: Not Found");
                } else if (status === 500) {
                    setError("Ошибка 500: Internal Server Error");
                } else {
                    setError(`Ошибка сервера при сохранении: код ${status}`);
                }
            } else {
                setError("Ошибка: не удалось подключится к серверу");
            } 
        });
    };

    if (!currentPass && error) {
        return (
            <div style={{padding:'20px'}}>
                <div style={{ color: 'red', border: '1px solid red', padding: '15px', backgroundColor: '#fff5f5', marginBottom: '15px', width:'400px'}}>
                    {error}
                </div>
                <Link to="/">Вернуться к списку пропусков</Link>
            </div>
        );
    }

    if (!currentPass) {
        return <div>Загрузка формы редактирования...</div>
    }

    return (
        <div className="container">
            <h1>Редактирование пропуска N{id}</h1>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-group">
                <label>ФИО Владельца: </label>
                <input type="text" ref={ownerRef} defaultValue={currentPass.owner} required />

                <label>Зона доступа: </label>
                <input type="text" ref={accessZoneRef} defaultValue={currentPass.accessZone} required />

                <label>Статус:</label>
                <select ref={statusRef} defaultValue={currentPass.status} required>
                    <option value="Активен">Активен</option>
                    <option value="Аннулирован">Аннулирован</option>
                </select>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px'}}>
                    Сохранить
                </button>
            </form>
            <br/>
            <Link to={`/detail/${id}`} className="btn btn-secondary" style={{textDecoration: 'none', display: 'inline-block'}}>
                Отмена
            </Link>
        </div>
    );
};

export default Edit;