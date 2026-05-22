#include <iostream>
#include <vector>
#include <random>
#include <chrono>
#include <immintrin.h>
#include <algorithm>

using namespace std;

void DGEMM_BLAS(vector<double>& arr1,vector<double>& arr2, vector<double>& res, int size);
void DGEMM_opt_1(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size);
void DGEMM_opt_2(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size, int BLOCK);
void DGEMM_opt_3(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size);
void randMatrix(vector<double>& matrix, int size);
void output(vector<double>& matrix, int size);

int main(int argc, char* argv[]) {
    int size;
    try {
        if (argc != 2) {
            cerr << "Use: ./program size" << endl;
            return 1;
        }
        size = stoi(argv[1]);
    } catch (const invalid_argument &e) {
        cerr << "Error: size matrix must be integer" << endl;
        return 1;
    }
    
    if (size <= 0 || size > 4000) {
        cerr << "Incorrect value size matrix! Must be >0 and <=4000";
        return 1;
    }

    // (n * p) x (p * m) = n * m, тогда размер матрицы size * size
    vector<double> matrix1(size * size),  matrix2(size * size), res(size * size);
    randMatrix(matrix1, size);
    randMatrix(matrix2, size);

    auto start1 = chrono::steady_clock::now();
    DGEMM_BLAS(matrix1, matrix2, res, size);
    auto end1 = chrono::steady_clock::now();

    auto duration1 = chrono::duration_cast<chrono::milliseconds>(end1 - start1);

    auto start2 = chrono::steady_clock::now();
    DGEMM_opt_1(matrix1, matrix2, res, size);
    auto end2 = chrono::steady_clock::now();
    
    auto duration2 = chrono::duration_cast<chrono::milliseconds>(end2 - start2);

    int BLOCK = 64; // можно поменять если нужно
    auto start3 = chrono::steady_clock::now();
    DGEMM_opt_2(matrix1, matrix2, res, size, BLOCK);
    auto end3 = chrono::steady_clock::now();
    auto duration3 = chrono::duration_cast<chrono::milliseconds>(end3 - start3);

    auto start4 = chrono::steady_clock::now();
    DGEMM_opt_3(matrix1, matrix2, res, size);
    auto end4 = chrono::steady_clock::now();
    auto duration4 = chrono::duration_cast<chrono::milliseconds>(end4 - start4);

    cout << "Runtime: " << endl;
    cout << "DGEMM_BLAS: " << duration1.count() << " ms" << endl;
    cout << "DGEMM_opt_1: " << duration2.count() << " ms" << endl;
    cout << "DGEMM_opt_2: " << duration3.count() << " ms" << endl;
    cout << "DGEMM_opt_3: " << duration4.count() << " ms" << endl;

    return 0;
}

// функция принимает адрес двух матриц и результата, потом записывает в матрицу res результат/ перемножение идет строка х столбец
void DGEMM_BLAS(vector<double>& arr1,vector<double>& arr2, vector<double>& res, int size) {
    fill(res.begin(), res.end(), 0.0);
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            for (int k = 0; k < size; k++) {
                res[i * size + j] += arr1[i * size + k] * arr2[k * size + j];
            }
        }
    }
}

//мы транспонируем матрицу вторую и по строкам работаем
void DGEMM_opt_1(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size) {
    fill(res.begin(), res.end(),  0.0);
    vector<double> arr2_transpose(size * size);
    for (int i = 0; i < size; ++i) {
        for (int j = 0; j < size; ++j) {
            arr2_transpose[j * size + i] = arr2[i * size + j];
        }
    }
    
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            for (int k = 0; k <size; k++) {
                res[i*size+j] += arr1[i*size + k] * arr2_transpose[j*size+k];
            }
        }
    }

}

void DGEMM_opt_2(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size, int BLOCK) {
    fill(res.begin(), res.end(), 0.0);
    
    //перебор блоков
    for (int ii = 0; ii < size; ii += BLOCK) {
        for (int jj = 0; jj < size; jj += BLOCK) {
            for (int kk = 0; kk < size; kk += BLOCK) {
                //внутр циклы умножение внутри блока
                // границы 
                int i_end = min(ii + BLOCK, size);
                int j_end = min(jj + BLOCK, size);
                int k_end = min(kk + BLOCK, size);
                
                for (int i = ii; i < i_end; ++i) {
                    for (int j = jj; j < j_end; ++j) {
                        double sum = 0.0;
                        for (int k = kk; k < k_end; ++k) {
                            sum += arr1[i * size + k] * arr2[k * size + j];
                        }
                        res[i * size + j] += sum;
                    }
                }
            }
        }
    }
}

void DGEMM_opt_3(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size) {
    fill(res.begin(), res.end(), 0.0);
    
    //транспонируем 2 матрицу для построчного доступа
    vector<double> arr2_transpose(size * size);
    for (int i = 0; i < size; ++i) {
        for (int j = 0; j < size; ++j) {
            arr2_transpose[j * size + i] = arr2[i * size + j];
        }
    }

    for (int i = 0; i < size; ++i) {
        for (int j = 0; j < size; j += 4) {
            if (j + 3 < size) {
                //avx: обрабатываем 4 элемента за раз
                __m256d c_vec = _mm256_setzero_pd();
                
                for (int k = 0; k < size; ++k) {
                    __m256d a_vec = _mm256_set1_pd(arr1[i * size + k]);
                    __m256d b_vec = _mm256_loadu_pd(&arr2_transpose[j * size + k]);
                    c_vec = _mm256_fmadd_pd(a_vec, b_vec, c_vec);
                }
                
                _mm256_storeu_pd(&res[i * size + j], c_vec);
            } else {
                //cкалярная обработка для остатка
                for (int jj = j; jj < min(j + 4, size); ++jj) {
                    double sum = 0.0;
                    for (int k = 0; k < size; ++k) {
                        sum += arr1[i * size + k] * arr2_transpose[jj * size + k];
                    }
                    res[i * size + jj] = sum;
                }
            }
        }
    }
}


void randMatrix(vector<double>& matrix, int size) {
    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<double> dist (-10.0, 10.0);

    for (int i = 0; i < size * size; i++) {
        matrix[i] = dist(gen);
    }
}

void output(vector<double>& matrix, int size) {
    if (size < 10) {
        for (int i = 0; i < size; i++) {
                for (int j = 0; j < size; j++) {
                    cout << matrix[i * size + j] << "    ";
                }
            cout << "\n";
        }
    } else {
        cout << "Matrix larger than 10 is not displayed" << endl;
    }
}