// Сохрани как: lab4_cpu.cpp
// Компиляция (GCC/MinGW): g++ lab4_cpu.cpp -o lab4_cpu -O3 -fopenmp -pthread -ltbb
#include <iostream>
#include <vector>
#include <random>
#include <chrono>
#include <pthread.h>
#include <omp.h>
#include <tbb/tbb.h>

using namespace std;

// Структуры для Pthreads
struct ThreadData {
    int start_row, end_row, size;
    const double *arr1, *arr2_T;
    double *res;
};

struct InitData {
    int start_idx, end_idx, seed;
    double *matrix;
};

// --- Pthreads Функции ---
void* pthreads_init_worker(void* arg) {
    InitData* data = (InitData*)arg;
    mt19937 gen(data->seed);
    uniform_real_distribution<double> dist(-10.0, 10.0);
    for (int i = data->start_idx; i < data->end_idx; ++i) {
        data->matrix[i] = dist(gen);
    }
    pthread_exit(nullptr);
    return nullptr;
}

void* pthreads_mult_worker(void* arg) {
    ThreadData* data = (ThreadData*)arg;
    int size = data->size;
    for (int i = data->start_row; i < data->end_row; i++) {
        for (int j = 0; j < size; j++) {
            double sum = 0.0;
            for (int k = 0; k < size; k++) {
                sum += data->arr1[i * size + k] * data->arr2_T[j * size + k];
            }
            data->res[i * size + j] = sum;
        }
    }
    pthread_exit(nullptr);
    return nullptr;
}

// --- Основные функции методов ---

// 1. POSIX Threads
void DGEMM_Pthreads(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size, int num_threads) {
    vector<double> arr2_T(size * size);
    for (int i = 0; i < size; ++i)
        for (int j = 0; j < size; ++j)
            arr2_T[j * size + i] = arr2[i * size + j];

    vector<pthread_t> threads(num_threads);
    vector<ThreadData> t_data(num_threads);
    int chunk = size / num_threads;

    for (int i = 0; i < num_threads; ++i) {
        t_data[i].start_row = i * chunk;
        t_data[i].end_row = (i == num_threads - 1) ? size : (i + 1) * chunk;
        t_data[i].size = size;
        t_data[i].arr1 = arr1.data();
        t_data[i].arr2_T = arr2_T.data();
        t_data[i].res = res.data();
        pthread_create(&threads[i], nullptr, pthreads_mult_worker, &t_data[i]);
    }

    for (int i = 0; i < num_threads; ++i) {
        pthread_join(threads[i], nullptr);
    }
}

// 2. OpenMP
void DGEMM_OpenMP(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size, int num_threads) {
    vector<double> arr2_T(size * size);
    
    #pragma omp parallel for num_threads(num_threads)
    for (int i = 0; i < size; ++i) {
        for (int j = 0; j < size; ++j) {
            arr2_T[j * size + i] = arr2[i * size + j];
        }
    }

    #pragma omp parallel for num_threads(num_threads)
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            double sum = 0.0;
            for (int k = 0; k < size; k++) {
                sum += arr1[i * size + k] * arr2_T[j * size + k];
            }
            res[i * size + j] = sum;
        }
    }
}

// 3. Intel TBB
void DGEMM_TBB(vector<double>& arr1, vector<double>& arr2, vector<double>& res, int size, int num_threads) {
    tbb::global_control c(tbb::global_control::max_allowed_parallelism, num_threads);
    vector<double> arr2_T(size * size);

    tbb::parallel_for(0, size, [&](int i) {
        for (int j = 0; j < size; ++j) {
            arr2_T[j * size + i] = arr2[i * size + j];
        }
    });

    tbb::parallel_for(0, size, [&](int i) {
        for (int j = 0; j < size; j++) {
            double sum = 0.0;
            for (int k = 0; k < size; k++) {
                sum += arr1[i * size + k] * arr2_T[j * size + k];
            }
            res[i * size + j] = sum;
        }
    });
}

// Параллельная генерация (OpenMP)
void randMatrix_Parallel(vector<double>& matrix, int size, int num_threads) {
    #pragma omp parallel num_threads(num_threads)
    {
        mt19937 gen(omp_get_thread_num() + time(0));
        uniform_real_distribution<double> dist(-10.0, 10.0);
        
        #pragma omp for
        for (int i = 0; i < size * size; i++) {
            matrix[i] = dist(gen);
        }
    }
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        cerr << "Usage: ./lab4_cpu <size> <threads>" << endl;
        return 1;
    }
    int size = stoi(argv[1]);
    int threads = stoi(argv[2]);

    vector<double> matrix1(size * size), matrix2(size * size), res(size * size);
    
    // Инициализация в потоках
    randMatrix_Parallel(matrix1, size, threads);
    randMatrix_Parallel(matrix2, size, threads);

    // Тест OpenMP
    auto start = chrono::steady_clock::now();
    DGEMM_OpenMP(matrix1, matrix2, res, size, threads);
    auto end = chrono::steady_clock::now();
    cout << "OpenMP Runtime: " << chrono::duration_cast<chrono::milliseconds>(end - start).count() << " ms\n";

    // Тест Pthreads
    fill(res.begin(), res.end(), 0.0);
    start = chrono::steady_clock::now();
    DGEMM_Pthreads(matrix1, matrix2, res, size, threads);
    end = chrono::steady_clock::now();
    cout << "Pthreads Runtime: " << chrono::duration_cast<chrono::milliseconds>(end - start).count() << " ms\n";

    // Тест TBB
    fill(res.begin(), res.end(), 0.0);
    start = chrono::steady_clock::now();
    DGEMM_TBB(matrix1, matrix2, res, size, threads);
    end = chrono::steady_clock::now();
    cout << "Intel TBB Runtime: " << chrono::duration_cast<chrono::milliseconds>(end - start).count() << " ms\n";

    return 0;
}