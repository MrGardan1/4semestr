import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Form = () => {
    
    const  navigate = useNavigate();
    const accessZoneRef = useRef(null);
    const ownerRef = useRef(null);

    let newPassData = {};
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();//не перезагружать страницу при отправки данных

        const ownerValue = ownerRef.current.value.trim(); //отрезает лишние пробелы по краям
        const accessZoneValue = accessZoneRef.current.value.trim();

        if (ownerValue.length < 3) {
            setError("Ошибка: ФИО должно содержать минимум 3 буквы");
            return;
        }

        if (accessZoneValue.length < 2) {
            setError("Ошибка: название зоны доступа слишком короткое");
            return;
        }

        setError('');

        newPassData = {
            owner: ownerValue,
            accessZone: accessZoneValue,
            status: "Активен"
        };

        axios.post('http://localhost:5000/passes', JSON.stringify(newPassData), {
            headers: {"Content-Type": "application/json"}
        })
            .then(response => {
                console.log("Добавлен пропуск: ", response.data);
                setError('');
                navigate('/');
            })
            .catch(error => {
                console.error("Ошибка создания: ", error);
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
    };

    return (
        <div className="container">

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-group">
                <label>ФИО Владельца:</label>
                <input type="text" ref={ownerRef} placeholder="Иванов Иван Иванович" required />
                
                <label>Зона доступа:</label>
                <input type="text" ref={accessZoneRef} placeholder="Терминал В, Диспетчерская" required />

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px'}}>
                    Добавить пропуск
                </button>
            </form>
            <br/>
            <Link to="/" className="btn btn-secondary" style={{textDecoration: 'none', display: 'inline-block'}}>
                Отмена
            </Link>
        </div>
    );
};

export default Form;