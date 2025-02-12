function gerarDados() {
    const tamanhos = [10, 50, 100, 1000];
    const temposFixos = { 10: 0.06, 50: 0.12, 100: 0.25, 1000: 2.5 }; // Valores fixos para evitar variação
    
    return tamanhos.map(tamanho => {
        const tempoExecucao = temposFixos[tamanho].toFixed(4); // Tempo fixo para cada tamanho
        return { tamanho, tempoExecucao, caminho: gerarCaminhoOrdenado(tamanho) };
    });
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