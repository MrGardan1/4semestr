import React, {useState, useContext, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PassContext } from '../context/PassContext';

const Home = () => {
    const {passes, setPasses} = useContext(PassContext);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get("http://217.71.129.139:5754/passes")
            .then(response => {setPasses(response.data); setError('');})
            .catch(error => {
                console.error("Ошибка получения данных:", error);

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
    }, [setPasses])

    if (error) {
        return (
            <div style={{color: 'red', border: '1px solid red', padding: '15px', backgroundColor: '#fff5f5'}}>
                {error}
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Список пропусков</h1>
            <ul className="pass-list">
                {passes.map(pass => (
                    <li key={pass.id} className="pass-item">
                        <Link to={`/detail/${pass.id}`} className="pass-link">   
                            <strong>Пропуск: </strong>{pass.owner} <span style={{color: '#718096'}}>({pass.accessZone})</span>
                        </Link>
                    </li>
                ))}

            </ul>
            <Link to={"/add"}className="btn btn-primary" style={{ display: 'inline-block' }}>
                Выдать новый пропуск
            </Link>
        </div>
    );
};
export default Home;