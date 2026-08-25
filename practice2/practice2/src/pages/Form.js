import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Form = () => {
    const navigate = useNavigate();
    
    const ownerRef = useRef(null);
    const positionRef = useRef(null);
    const birthDateRef = useRef(null);
    const passTypeRef = useRef(null);
    const accessZoneRef = useRef(null);
    const issueDateRef = useRef(null);
    const validUntilRef = useRef(null);

    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const ownerValue = ownerRef.current.value.trim();
        const accessZoneValue = accessZoneRef.current.value.trim();
        const positionValue = positionRef.current.value.trim();
        const passTypeValue = passTypeRef.current.value;
        const issueDateValue = new Date(issueDateRef.current.value);

        if (ownerValue.length < 3) {
            setError("Ошибка: ФИО должно содержать минимум 3 буквы");
            return;
        }

        let finalValidUntil;
        // проверяем тип пропуска
        if (passTypeValue === "Временный") {
            const threeHoursLater = new Date(issueDateValue.getTime() + 3 * 60 * 60 * 1000);
            finalValidUntil = threeHoursLater.toISOString(); 
        } else {
            finalValidUntil = new Date(validUntilRef.current.value).toISOString();
        }

        setError('');

        const newPassData = {
            owner: ownerValue,
            position: positionValue,
            birthDate: birthDateRef.current.value,
            passType: passTypeValue,
            accessZone: accessZoneValue,
            issueDate: issueDateValue.toISOString(),
            validUntil: finalValidUntil,
            status: "Активен"
        };

        axios.post('http://217.71.129.139:4795/passes', JSON.stringify(newPassData), {
            headers: {"Content-Type": "application/json"}
        })
            .then(response => {
                setError('');
                navigate('/');
            })
            .catch(error => {
                setError("Ошибка подключения к серверу. Проверьте сеть.");
            });
    };

    return (
        <div className="container">
            <h1>Выдача нового пропуска</h1>
            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} className="form-group">
                <label>ФИО Владельца:</label>
                <input type="text" ref={ownerRef} required />
                
                <label>Должность:</label>
                <input type="text" ref={positionRef} required />

                <label>Дата рождения:</label>
                <input type="date" ref={birthDateRef} required style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />

                <label>Тип пропуска:</label>
                <select ref={passTypeRef} required>
                    <option value="Постоянный">Постоянный</option>
                    <option value="Временный">Временный (на 3 часа)</option>
                    <option value="Разовый">Разовый</option>
                </select>

                <label>Зона доступа:</label>
                <input type="text" ref={accessZoneRef} required />

                <label>Время выдачи:</label>
                <input type="datetime-local" ref={issueDateRef} required style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />

                <label>Действителен до (Игнорируется для временных):</label>
                <input type="datetime-local" ref={validUntilRef} style={{padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px'}} />

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