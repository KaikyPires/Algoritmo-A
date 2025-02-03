
function gerarDados() {
    const tamanhos = [10, 50, 100, 1000];
    return tamanhos.map(tamanho => {
        const tempoExecucao = (Math.random() * 10).toFixed(2);
        const caminhoEncontrado = Math.random() > 0.3;
        const caminho = caminhoEncontrado ? gerarCaminhoAleatorio(tamanho) : "Nenhum caminho encontrado";
        return { tamanho, tempoExecucao, caminho };
    });
}

function gerarCaminhoAleatorio(tamanho) {
    const caminho = [];
    let atual = 0;
    while (atual < tamanho - 1) {
        atual += Math.floor(Math.random() * 10) + 1;
        if (atual >= tamanho) break;
        caminho.push(atual);
    }
    caminho.push(tamanho - 1);
    return caminho;
}

function desenharGrafico(dados) {
    const ctx = document.getElementById("grafico").getContext("2d");
    new Chart(ctx, {
        type: "bar", // Alterado para gráfico de barras
        data: {
            labels: dados.map(d => d.tamanho),
            datasets: [{
                label: "Tempo de Execução (ms)",
                data: dados.map(d => d.tempoExecucao),
                borderColor: "#ffcc000",
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
