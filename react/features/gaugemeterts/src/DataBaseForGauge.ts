// import ApiLinks from './ApiLinks';
import Participante from "./Participante";

class DataBaseForGauge {
  static participantes: Participante[] = [
    new Participante("Aula 7 Turma 2: Aula dialogada - Tecnologias Digitais", 1, 1, "Professor", "avatar", 10, 4014, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 2, 1, "Manuela", "avatar", 10, 444, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 3, 1, "Angela", "avatar", 10, 348, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 4, 1, "Andreia", "avatar", 10, 336, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 5, 1, "Leonardo A.", "avatar", 10, 222, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 6, 1, "Carolina", "avatar", 10, 216, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 7, 1, "Mario", "avatar", 10, 12, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 8, 1, "Silvio", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 9, 1, "Arnaldo", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 10, 1, "Bianca", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 11, 1, "Deise", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 12, 1, "Davi", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 13, 1, "Jorge", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 14, 1, "Leonardo G.", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 15, 1, "Patricia", "avatar", 10, 0, 7200),
    new Participante("Aula dialogada - Tecnologias Digitais", 16, 1, "Ronaldo", "avatar", 10, 0, 7200),
  ];

  async percorrerParticipantes(): Promise<void> {
    console.log("Percorrendo todos os participantes:");
    DataBaseForGauge.participantes.forEach((participante) => {
      console.log(participante);
    });
  }

  // Retorna os participantes ordenados para o calculo de gine
  async getParticipantes(): Promise<Participante[]> {
    const participantesFinal = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);

    //------------------------------------------------------- 
    // COLUNA 3 do artigo
    // Calcula o fatorDeRiquezaAbsoluta de cada participante
    // Total de tempo de fala = Sigma(f)
    //------------------------------------------------------- 
    const totalTempoDeFalaEmSegundos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    let index = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorRiquezaAbsoluta =
        (participantesFinal[index].tempoDeFala / totalTempoDeFalaEmSegundos);
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 5 do artigo
    // Proporcao do tempo de presença de cada participante
    // Total de tempo de fala = Sigma(f)
    //------------------------------------------------------- 

    const totalTempoDePresença = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoPresenca.toString()), 0
    );

    console.log('totalTempoPresenca=', totalTempoDePresença);
    index = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorTempoPresenca =
        (participantesFinal[index].tempoPresenca / totalTempoDePresença);
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 6 do artigo
    // Proporcao de tempo de presenca ACUMULADA DA POPULACAO
    //-------------------------------------------------------  

    index = 0;
    let fatorTempoPresencaAcumuladoAnterior = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorAcumuladoPresenca =
        (participantesFinal[index].fatorTempoPresenca + fatorTempoPresencaAcumuladoAnterior);
      fatorTempoPresencaAcumuladoAnterior =
        participantesFinal[index].fatorAcumuladoPresenca;
      ++index;
    });

    //------------------------------------------------------- 
    // COLUNA 7 do artigo
    // Acumulo da proporção dos tempos de fala
    // Riqueza relativa acumulada - ponto da curva Lorenz
    //-------------------------------------------------------  
    index = 0;
    let fatorAcumuladoLorenz = 0;
    participantesFinal.forEach((participante) => {
      participantesFinal[index].fatorAcumuladoCurvaLorenz =
        (participantesFinal[index].fatorRiquezaAbsoluta + fatorAcumuladoLorenz);
      fatorAcumuladoLorenz =
        participantesFinal[index].fatorAcumuladoCurvaLorenz;
      ++index;
    });
    return participantesFinal;
  }

  async getParticipantesPercentualAcumuloFala(): Promise<Participante[]> {
    const participantesOrdenadosDescrescente = DataBaseForGauge.participantes.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    return participantesOrdenadosDescrescente;
  }

  async calcularGini(): Promise<number> {
    console.log("Colecao de participantes com o calculo de Gini: ", await this.getParticipantes());

    // Participantes ordenados de forma decrescente
    const participantesOrdenados = DataBaseForGauge.participantes.slice().sort((a, b) => b.tempoDeFala - a.tempoDeFala);
    console.log("Colecao de participantes: ", participantesOrdenados);

    /*
      Calcula a soma acumulativa dos tempos de fala dos participantes
    */

    const ocupantesDaSala = DataBaseForGauge.participantes.length;
    const somaAcumulativaTempo = participantesOrdenados.reduce((soma, participante) => {
      soma += participante.tempoDeFala;
      return soma;
    }, 0);

    console.log("Soma dos tempos:", somaAcumulativaTempo);
    console.log("Ocupantes da Sala:", ocupantesDaSala);

    /*
    Participantes ordenados de forma crescente
     */
    const participantesOrdenadosCrescente = DataBaseForGauge.participantes.slice().sort((a, b) => a.tempoDeFala - b.tempoDeFala);
    /*
    Remove o ultimo elemento da coleção conforme descrito na formula.
    */
    participantesOrdenadosCrescente.pop();

    /*
    Calculo Final do Gini e do participometro´ usando 1-formula
    */
    let fiAnterior = 0;
    let index = 0;
    const ultimaPosicao = participantesOrdenadosCrescente.length - 1;
    let somatorioFi = 0;
    let ultimoElemento = 0;
    participantesOrdenadosCrescente.forEach((participante) => {
      somatorioFi += ((fiAnterior + participante.fatorAcumuladoCurvaLorenz) * participante.fatorTempoPresenca);
      fiAnterior = participante.fatorAcumuladoCurvaLorenz;
      if (index === ultimaPosicao) {
        ultimoElemento = participante.fatorAcumuladoPresenca;
      }
      ++index;
    });

    /*
    Calculo final do Gini´ usando a formula do artigo
    */
    const giniIndex = (somatorioFi / (ultimoElemento ** 2));
    return giniIndex;
  }

  async calcularMediaTempoDeFala(): Promise<number> {
    if (DataBaseForGauge.participantes.length === 0) {
      console.log("Não encontrei participantes para calcular a média");
      return 0;
    }

    const totalTempoDeFalaEmMinutos = DataBaseForGauge.participantes.reduce(
      (total, participante) => total + parseInt(participante.tempoDeFala.toString()), 0
    );
    return totalTempoDeFalaEmMinutos / DataBaseForGauge.participantes.length;
  }
}

export default DataBaseForGauge;

