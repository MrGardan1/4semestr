// Сохрани как: lab4_mpi.cpp
// Компиляция: mpicxx lab4_mpi.cpp -o lab4_mpi
// Запуск: mpiexec -n 4 ./lab4_mpi <size>
#include <iostream>
#include <vector>
#include <random>
#include <mpi.h>

using namespace std;

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);
    int rank, size_mpi;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size_mpi);

    if (argc != 2) {
        if (rank == 0) cerr << "Usage: mpiexec -n <threads> ./lab4_mpi <size>\n";
        MPI_Finalize();
        return 1;
    }

    int N = stoi(argv[1]);
    int rows_per_process = N / size_mpi;
    
    vector<double> A, B(N * N), C;
    vector<double> local_A(rows_per_process * N);
    vector<double> local_C(rows_per_process * N, 0.0);

    if (rank == 0) {
        A.resize(N * N);
        C.resize(N * N);
        mt19937 gen(42);
        uniform_real_distribution<double> dist(-10.0, 10.0);
        for(int i=0; i<N*N; i++) { A[i] = dist(gen); B[i] = dist(gen); }
    }

    double start_time = MPI_Wtime();

    // Рассылка матрицы B всем и частей A каждому
    MPI_Bcast(B.data(), N * N, MPI_DOUBLE, 0, MPI_COMM_WORLD);
    MPI_Scatter(A.data(), rows_per_process * N, MPI_DOUBLE, 
                local_A.data(), rows_per_process * N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

    // Умножение (локальное)
    for (int i = 0; i < rows_per_process; i++) {
        for (int j = 0; j < N; j++) {
            double sum = 0.0;
            for (int k = 0; k < N; k++) {
                sum += local_A[i * N + k] * B[k * N + j];
            }
            local_C[i * N + j] = sum;
        }
    }

    // Сбор результатов
    MPI_Gather(local_C.data(), rows_per_process * N, MPI_DOUBLE,
               C.data(), rows_per_process * N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

    double end_time = MPI_Wtime();

    if (rank == 0) {
        cout << "MPI Runtime: " << (end_time - start_time) * 1000.0 << " ms" << endl;
    }

    MPI_Finalize();
    return 0;
}