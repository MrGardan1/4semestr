// Сохрани как: lab4_cuda.cu
// Компиляция: nvcc lab4_cuda.cu -o lab4_cuda
#include <iostream>
#include <vector>
#include <random>
#include <chrono>
#include <cuda_runtime.h>

using namespace std;

// Ядро GPU (выполняется на видеокарте)
__global__ void matrixMulCUDA(const double* A, const double* B, double* C, int N) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < N && col < N) {
        double sum = 0.0;
        for (int k = 0; k < N; ++k) {
            sum += A[row * N + k] * B[k * N + col];
        }
        C[row * N + col] = sum;
    }
}

int main(int argc, char* argv[]) {
    if (argc != 2) return 1;
    int size = stoi(argv[1]);
    size_t bytes = size * size * sizeof(double);

    vector<double> h_A(size * size), h_B(size * size), h_C(size * size);
    
    mt19937 gen(42);
    uniform_real_distribution<double> dist(-10.0, 10.0);
    for(int i=0; i<size*size; i++) { h_A[i] = dist(gen); h_B[i] = dist(gen); }

    double *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, bytes);
    cudaMalloc(&d_B, bytes);
    cudaMalloc(&d_C, bytes);

    cudaMemcpy(d_A, h_A.data(), bytes, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B.data(), bytes, cudaMemcpyHostToDevice);

    // Настройка сетки блоков
    dim3 threads(16, 16);
    dim3 blocks((size + threads.x - 1) / threads.x, (size + threads.y - 1) / threads.y);

    auto start = chrono::steady_clock::now();
    matrixMulCUDA<<<blocks, threads>>>(d_A, d_B, d_C, size);
    cudaDeviceSynchronize(); // Ждем завершения GPU
    auto end = chrono::steady_clock::now();

    cudaMemcpy(h_C.data(), d_C, bytes, cudaMemcpyDeviceToHost);

    cout << "CUDA Runtime: " << chrono::duration_cast<chrono::milliseconds>(end - start).count() << " ms\n";

    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
    return 0;
}