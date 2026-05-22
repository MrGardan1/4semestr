import React, { useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Form = () => {
    
    const  navigate = useNavigate();
    const accessZoneRef = useRef(null);
    const ownerRef = useRef(null);

    let newPassData = {};

    const handleSubmit = (e) => {
        e.preventDefault();//не перезагружать страницу при отправки данных

        newPassData = {
            owner: ownerRef.current.value,
            accessZone: accessZoneRef.current.value,
            status: "Активен"
        };

        axios.post('http://localhost:5000/passes', JSON.stringify(newPassData), {
            headers: {"Content-Type": "application/json"}
        })
            .then(response => {
                console.log("Добавлен пропуск: ", response.data);
                navigate('/');
            })
            .catch(error => console.error("Ошибка создания: ",error));
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', width: '300px', gap: '10px'}}>
                <label>ФИО Владельца:</label>
                <input type="text" ref={ownerRef} required />
                
                <label>Зона доступа:</label>
                <input type="text" ref={accessZoneRef} required />

                <button type="submit" style={{ marginTop: '10px', padding: '6px', cursor: 'pointer'}}>Добавить пропуск</button>
                <br/>
                <Link to={`/`}>Отмена</Link>
            </form>
        </div>
    );
};

export default Form;