import React, {useState, useContext, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PassContext } from '../context/PassContext';

const Home = () => {
    const {passes, setPasses} = useContext(PassContext);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get("http://217.71.129.139:4795/passes")
            .then(response => {
                setPasses(response.data);
                setError('');
            })
            .catch(error => {
                setError("Ошибка связи с сервером. Не удалось загрузить журнал.");
            });
    }, [setPasses]);

    
    const formatDate = (isoString) => {
        if (!isoString) return '';
        if (!isoString.includes('T')) return isoString; 
        return new Date(isoString).toLocaleString('ru-RU');
    };

    if (error) {
        return (
            <div className="container">
                <div className="error-box">{error}</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Журнал аудита пропусков</h1>
            <ul className="pass-list">
                {passes.map(pass => (
                    <li key={pass.id} className="pass-item">
                        <Link to={`/detail/${pass.id}`} className="pass-link" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>   
                            <div>
                                <strong>{pass.owner}</strong>
                                <div style={{fontSize: '13px', color: '#718096', marginTop: '4px'}}>
                                    {pass.position} | {pass.passType} до {formatDate(pass.validUntil)}
                                </div>
                            </div>
                            <span className={`status-badge ${pass.status === 'Активен' ? 'status-active' : 'status-canceled'}`}>
                                {pass.status}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link to={"/add"} className="btn btn-primary" style={{ display: 'inline-block' }}>
                Выдать новый пропуск
            </Link>
        </div>
    );
};

export default Home;