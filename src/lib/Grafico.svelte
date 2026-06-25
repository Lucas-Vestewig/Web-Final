<script>
    const moedas = [
        { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$' },
        { codigo: 'USD', nome: 'Dólar Americano', simbolo: '$' },
        { codigo: 'EUR', nome: 'Euro', simbolo: '€' },
        { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£' }
    ];

    let valor = $state(1);
    let origem = $state('USD');
    let destino = $state('BRL');
    let resultadoHoje = $state(null);
    let resultadoOntem = $state(null);
    let carregando = $state(false);
    let ultimos = []

    let texto = $state("")

    async function converter(intervalo) {
    carregando = true;

    try {
        for (let i = intervalo; i > 0; i--) {
            //pega dia
            let tempDate = new Date();
            tempDate.setDate(tempDate.getDate() - i);
            const data = tempDate.toLocaleDateString('sv-SE');
            //puxa api
            const res = await fetch(`/api/cambio?from=${origem}&to=${destino}&date=${data}`);
            const dados = await res.json();
            const taxa = dados.rates?.[destino];
            //poe no vetor
            ultimos.push({data,taxa});
            texto += `${data} = ${taxa}<br>`;
        }
    } catch (e) {
        console.error(e);
    } finally {
        carregando = false;
    }
}

    $effect(() => {
        origem;
        destino;
        valor;
        converter(30);
    });
</script>

<div>
    {@html texto}
</div>