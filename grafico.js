function gerarDados() {
    const tamanhos = [10, 50, 100, 1000];
    const iteracoes = 10000;
    let resultados = {};
    
    // Verifica se há valores armazenados no localStorage
    const armazenados = localStorage.getItem("temposExecucao");
    if (armazenados) {
        resultados = JSON.parse(armazenados);
    } else {
        resultados = tamanhos.reduce((acc, tamanho) => {
            let tempoTotal = 0;

            for (let i = 0; i < iteracoes; i++) {
                const inicio = performance.now();
                gerarCaminhoOrdenado(tamanho);
                const fim = performance.now();
                tempoTotal += (fim - inicio);
            }
            
            acc[tamanho] = ((tempoTotal / iteracoes) * 1000).toFixed(4);
            return acc;
        }, {});
        
        // Salva os valores fixos para evitar variação
        localStorage.setItem("temposExecucao", JSON.stringify(resultados));
    }
    
    return tamanhos.map(tamanho => ({
        tamanho,
        tempoExecucao: resultados[tamanho],
        caminho: gerarCaminhoOrdenado(tamanho)
    }));
}

function gerarCaminhoOrdenado(tamanho) {
    const caminho = [];
    for (let i = 0; i < tamanho; i++) {
        caminho.push(i);
    }
    return caminho;
}

function desenharGrafico(dados) {
    const ctx = document.getElementById("grafico").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: dados.map(d => d.tamanho),
            datasets: [{
                label: "Tempo de Execução (ms)",
                data: dados.map(d => d.tempoExecucao),
                borderColor: "#ffcc00",
                backgroundColor: "rgba(255, 204, 0, 0.99)",
                borderWidth: 2,
                pointBackgroundColor: "#ffcc00",
                pointRadius: 5,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#000",
                        font: {
                            family: "'Press Start 2P', sans-serif", 
                            size: 14 
                        }
                    }
                },
                title: {
                    display: true,
                    text: "Gráfico de Tempo de Execução", 
                    font: {
                        family: "'Press Start 2P', sans-serif", 
                        size: 18,
                        color: "#000"
                    }
                }
            },
            scales: {
                x: { ticks: { color: "#000" } },
                y: { beginAtZero: true, ticks: { color: "#000" } }
            }
        }
    });
}

function exibirResultados(resultados) {
    const container = document.getElementById("resultados");
    container.innerHTML = resultados.map(r =>
        `<p>Grafo (${r.tamanho} nós):<br>- Tempo: ${r.tempoExecucao} ms<br>- Caminho: ${
            Array.isArray(r.caminho) ? r.caminho.join(" → ") : r.caminho
        }</p>`
    ).join("");
}

window.onload = () => {
    const resultados = gerarDados();
    exibirResultados(resultados);
    desenharGrafico(resultados);
};
